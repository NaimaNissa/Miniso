package httpapi

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Server struct {
	DB     *pgxpool.Pool
	Secret string
}

type User struct {
	ID        string  `json:"id"`
	Email     string  `json:"email"`
	Name      string  `json:"name"`
	Initials  string  `json:"initials"`
	Role      string  `json:"role"`
	Title     string  `json:"title"`
	Workspace string  `json:"workspace"`
	BranchID  *string `json:"branchId"`
	Phone     string  `json:"phone,omitempty"`
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"ok": "true"})
	})
	mux.HandleFunc("POST /v1/auth/login", s.login)
	mux.HandleFunc("POST /v1/auth/signup", s.signup)
	mux.HandleFunc("GET /v1/public/stores", s.publicStores)
	mux.HandleFunc("GET /v1/invites/token/{token}", s.getInviteByToken)
	mux.HandleFunc("POST /v1/invites/accept", s.acceptInvite)
	mux.HandleFunc("GET /v1/me", s.authed(s.me))
	mux.HandleFunc("GET /v1/snapshot", s.authed(s.snapshot))
	mux.HandleFunc("GET /v1/staff", s.authed(s.staffBundle))
	mux.HandleFunc("POST /v1/staff/clock", s.authed(s.clock))
	mux.HandleFunc("PATCH /v1/staff/me", s.authed(s.updateProfile))
	mux.HandleFunc("POST /v1/staff/leave", s.authed(s.requestLeave))
	mux.HandleFunc("POST /v1/leaves/{id}/review", s.authed(s.reviewLeave))
	mux.HandleFunc("POST /v1/pos/checkout", s.authed(s.checkout))
	mux.HandleFunc("POST /v1/approvals", s.authed(s.createApprovalRequest))
	mux.HandleFunc("POST /v1/approvals/{id}/decision", s.authed(s.decideApproval))
	mux.HandleFunc("GET /v1/invites", s.authed(s.listInvites))
	mux.HandleFunc("POST /v1/invites", s.authed(s.createInvite))
	mux.HandleFunc("POST /v1/invites/{id}/resend", s.authed(s.resendInvite))
	mux.HandleFunc("POST /v1/invites/{id}/revoke", s.authed(s.revokeInvite))
	mux.HandleFunc("POST /v1/transfers", s.authed(s.createTransfer))
	mux.HandleFunc("POST /v1/transfers/{id}/receive", s.authed(s.receiveTransfer))
	mux.HandleFunc("POST /v1/adjustments", s.authed(s.createAdjustment))
	mux.HandleFunc("POST /v1/shipments", s.authed(s.createShipment))
	mux.HandleFunc("POST /v1/shipments/{id}/receive", s.authed(s.receiveShipment))
	mux.HandleFunc("POST /v1/operations/{id}/toggle", s.authed(s.toggleOperation))
	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) authed(next func(http.ResponseWriter, *http.Request, User)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := s.userFromRequest(r)
		if err != nil {
			writeErr(w, http.StatusUnauthorized, "Sign in required")
			return
		}
		next(w, r, user)
	}
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid login payload")
		return
	}
	user, hash, err := s.userByEmail(r.Context(), strings.ToLower(strings.TrimSpace(body.Email)))
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)) != nil {
		writeErr(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}
	token, err := s.sign(user.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not start session")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"token": token,
		"user":  user,
		"home":  homeFor(user.Role),
	})
}

func (s *Server) me(w http.ResponseWriter, r *http.Request, user User) {
	writeJSON(w, http.StatusOK, user)
}

func (s *Server) publicStores(w http.ResponseWriter, r *http.Request) {
	rows, err := s.DB.Query(r.Context(), `SELECT id, name, city FROM stores ORDER BY name`)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not load branches")
		return
	}
	defer rows.Close()
	list := []map[string]string{}
	for rows.Next() {
		var id, name, city string
		if err := rows.Scan(&id, &name, &city); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not load branches")
			return
		}
		list = append(list, map[string]string{"id": id, "name": name, "city": city})
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *Server) userByEmail(ctx context.Context, email string) (User, string, error) {
	var user User
	var hash string
	var branch *string
	err := s.DB.QueryRow(ctx, `
		SELECT id, email, password_hash, name, initials, role, title, workspace, branch_id, phone
		FROM users WHERE email=$1`, email).Scan(
		&user.ID, &user.Email, &hash, &user.Name, &user.Initials, &user.Role, &user.Title, &user.Workspace, &branch, &user.Phone,
	)
	user.BranchID = branch
	return user, hash, err
}

func (s *Server) userByID(ctx context.Context, id string) (User, error) {
	var user User
	var branch *string
	err := s.DB.QueryRow(ctx, `
		SELECT id, email, name, initials, role, title, workspace, branch_id, phone
		FROM users WHERE id=$1`, id).Scan(
		&user.ID, &user.Email, &user.Name, &user.Initials, &user.Role, &user.Title, &user.Workspace, &branch, &user.Phone,
	)
	user.BranchID = branch
	return user, err
}

func (s *Server) userFromRequest(r *http.Request) (User, error) {
	header := r.Header.Get("Authorization")
	token := strings.TrimPrefix(header, "Bearer ")
	if token == "" || token == header {
		return User{}, errors.New("missing token")
	}
	id, err := s.parse(token)
	if err != nil {
		return User{}, err
	}
	return s.userByID(r.Context(), id)
}

func (s *Server) sign(userID string) (string, error) {
	exp := time.Now().Add(14 * 24 * time.Hour).Unix()
	payload := base64.RawURLEncoding.EncodeToString([]byte(userID + "|" + strconv.FormatInt(exp, 10)))
	mac := hmac.New(sha256.New, []byte(s.Secret))
	_, _ = mac.Write([]byte(payload))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return payload + "." + sig, nil
}

func (s *Server) parse(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return "", errors.New("bad token")
	}
	mac := hmac.New(sha256.New, []byte(s.Secret))
	_, _ = mac.Write([]byte(parts[0]))
	expected := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(parts[1])) {
		return "", errors.New("bad signature")
	}
	raw, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", err
	}
	bits := strings.Split(string(raw), "|")
	if len(bits) != 2 {
		return "", errors.New("bad payload")
	}
	exp, err := strconv.ParseInt(bits[1], 10, 64)
	if err != nil || time.Now().Unix() > exp {
		return "", errors.New("expired")
	}
	return bits[0], nil
}

func homeFor(role string) string {
	switch role {
	case "owner", "inventory_manager":
		return "/dashboard/owner"
	case "store_manager":
		return "/dashboard/branch"
	case "warehouse_staff":
		return "/warehouse"
	case "social_media":
		return "/social"
	case "staff":
		return "/staff"
	default:
		return "/home"
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeErr(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func secret() string {
	if value := os.Getenv("JWT_SECRET"); value != "" {
		return value
	}
	return "miniso-retail-os-dev"
}

func branchOf(user User) string {
	if user.BranchID != nil {
		return *user.BranchID
	}
	return ""
}

func isManager(user User) bool {
	return user.Role == "owner" || user.Role == "store_manager"
}
