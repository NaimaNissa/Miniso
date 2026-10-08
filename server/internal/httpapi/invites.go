package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var inviteRoleLabels = map[string]string{
	"inventory_manager": "Inventory Manager",
	"warehouse_staff":   "Warehouse Staff",
	"store_manager":     "Branch Manager",
	"social_media":      "Social Media",
	"staff":             "Branch Staff",
}

func defaultTitleForRole(role, position string) string {
	if role == "staff" && position != "" {
		return position
	}
	if label, ok := inviteRoleLabels[role]; ok {
		return label
	}
	return role
}

func (s *Server) createInvite(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "store_manager" {
		writeErr(w, http.StatusForbidden, "Only HQ or branch managers can invite people")
		return
	}
	var body struct {
		Email       string `json:"email"`
		Role        string `json:"role"`
		Name        string `json:"name"`
		Title       string `json:"title"`
		Position    string `json:"position"`
		BranchID    string `json:"branchId"`
		WarehouseID string `json:"warehouseId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid invite payload")
		return
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))
	body.Role = strings.TrimSpace(strings.ToLower(body.Role))
	body.Name = strings.TrimSpace(body.Name)
	body.Title = strings.TrimSpace(body.Title)
	body.Position = strings.TrimSpace(body.Position)
	body.BranchID = strings.TrimSpace(body.BranchID)
	body.WarehouseID = strings.TrimSpace(body.WarehouseID)

	if body.Email == "" || !strings.Contains(body.Email, "@") {
		writeErr(w, http.StatusBadRequest, "A valid work email is required")
		return
	}
	if _, ok := inviteRoleLabels[body.Role]; !ok {
		writeErr(w, http.StatusBadRequest, "Choose a supported role")
		return
	}
	if user.Role == "store_manager" {
		if body.Role != "staff" && body.Role != "social_media" {
			writeErr(w, http.StatusForbidden, "Branch managers can invite staff or social agents only")
			return
		}
		branch := branchOf(user)
		if branch == "" {
			writeErr(w, http.StatusBadRequest, "Your account needs a branch before inviting")
			return
		}
		body.BranchID = branch
	}
	if user.Role == "inventory_manager" && body.Role != "warehouse_staff" && body.Role != "staff" {
		writeErr(w, http.StatusForbidden, "Inventory managers invite warehouse or branch staff")
		return
	}

	needsBranch := body.Role == "store_manager" || body.Role == "social_media" || body.Role == "staff"
	if needsBranch && body.BranchID == "" {
		writeErr(w, http.StatusBadRequest, "Pick a branch for this role")
		return
	}
	if body.Role == "staff" && body.Position == "" {
		body.Position = "Cashier"
	}
	if body.Title == "" {
		body.Title = defaultTitleForRole(body.Role, body.Position)
	}

	ctx := r.Context()
	var exists int
	_ = s.DB.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE email=$1`, body.Email).Scan(&exists)
	if exists > 0 {
		writeErr(w, http.StatusConflict, "That email already has an account — ask them to sign in")
		return
	}
	_ = s.DB.QueryRow(ctx, `
		SELECT COUNT(*) FROM invites
		WHERE email=$1 AND status='pending' AND expires_at > now()`, body.Email).Scan(&exists)
	if exists > 0 {
		writeErr(w, http.StatusConflict, "An open invite already exists for that email")
		return
	}

	workspace := "Bangladesh HQ"
	if body.BranchID != "" {
		var storeName string
		if err := s.DB.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, body.BranchID).Scan(&storeName); err != nil {
			writeErr(w, http.StatusBadRequest, "Unknown branch")
			return
		}
		workspace = storeName
	}
	if body.Role == "warehouse_staff" {
		if body.WarehouseID == "" {
			body.WarehouseID = "WH-BD-DHK-01"
		}
		var whName string
		if err := s.DB.QueryRow(ctx, `SELECT name FROM warehouses WHERE id=$1`, body.WarehouseID).Scan(&whName); err != nil {
			writeErr(w, http.StatusBadRequest, "Unknown warehouse")
			return
		}
		workspace = whName
	}
	if body.Role == "inventory_manager" {
		workspace = "Supply Chain HQ"
	}

	token, err := randomToken(24)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create invite")
		return
	}
	id := fmt.Sprintf("INV-%d", time.Now().UnixNano())
	expires := time.Now().Add(7 * 24 * time.Hour)
	inviteURL := appBaseURL() + "/invite/" + token

	var branchID, warehouseID any
	if body.BranchID != "" {
		branchID = body.BranchID
	}
	if body.WarehouseID != "" {
		warehouseID = body.WarehouseID
	}

	mail := sendInviteEmail(body.Email, body.Name, inviteRoleLabels[body.Role], user.Name, inviteURL, workspace)
	if _, err := s.DB.Exec(ctx, `
		INSERT INTO invites (
			id, token, email, role, title, position, name, branch_id, warehouse_id,
			invited_by, invited_by_name, status, email_status, email_error, expires_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',$12,$13,$14)`,
		id, token, body.Email, body.Role, body.Title, body.Position, body.Name,
		branchID, warehouseID, user.ID, user.Name, mail.Status, mail.Error, expires,
	); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save invite")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":          id,
		"email":       body.Email,
		"role":        body.Role,
		"roleLabel":   inviteRoleLabels[body.Role],
		"workspace":   workspace,
		"inviteUrl":   inviteURL,
		"emailStatus": mail.Status,
		"emailError":  mail.Error,
		"expiresAt":   expires.Format(time.RFC3339),
		"message":     inviteDeliveryMessage(mail.Status),
	})
}

func inviteDeliveryMessage(status string) string {
	switch status {
	case "sent":
		return "Invitation email sent. They can open the link to create their account."
	case "queued_local":
		return "Invite created. Configure SMTP or RESEND_API_KEY to deliver email; share the invite link for now."
	default:
		return "Invite created, but email delivery failed. Share the invite link manually."
	}
}

func (s *Server) listInvites(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "store_manager" {
		writeErr(w, http.StatusForbidden, "Not allowed")
		return
	}
	ctx := r.Context()
	q := `
		SELECT id, email, role, title, position, name,
		       COALESCE(branch_id,''), COALESCE(warehouse_id,''),
		       invited_by_name, status, email_status, email_error,
		       to_char(created_at, 'DD Mon YYYY · HH24:MI'),
		       to_char(expires_at, 'DD Mon YYYY'),
		       COALESCE(accepted_user_id,'')
		FROM invites`
	args := []any{}
	if user.Role == "store_manager" {
		q += ` WHERE branch_id=$1`
		args = append(args, branchOf(user))
	} else if user.Role == "inventory_manager" {
		q += ` WHERE role IN ('warehouse_staff','staff') OR invited_by=$1`
		args = append(args, user.ID)
	}
	q += ` ORDER BY created_at DESC LIMIT 80`
	rows, err := s.DB.Query(ctx, q, args...)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not load invites")
		return
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, email, role, title, position, name, branchID, warehouseID, by, status, emailStatus, emailError, created, expires, acceptedUser string
		if err := rows.Scan(&id, &email, &role, &title, &position, &name, &branchID, &warehouseID, &by, &status, &emailStatus, &emailError, &created, &expires, &acceptedUser); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not load invites")
			return
		}
		list = append(list, map[string]any{
			"id": id, "email": email, "role": role, "roleLabel": inviteRoleLabels[role],
			"title": title, "position": position, "name": name,
			"branchId": branchID, "warehouseId": warehouseID,
			"invitedBy": by, "status": status, "emailStatus": emailStatus, "emailError": emailError,
			"createdAt": created, "expiresAt": expires, "acceptedUserId": acceptedUser,
		})
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *Server) resendInvite(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "store_manager" {
		writeErr(w, http.StatusForbidden, "Not allowed")
		return
	}
	id := r.PathValue("id")
	ctx := r.Context()
	var email, role, name, branchID, warehouseID, token, status string
	var expires time.Time
	err := s.DB.QueryRow(ctx, `
		SELECT email, role, name, COALESCE(branch_id,''), COALESCE(warehouse_id,''), token, status, expires_at
		FROM invites WHERE id=$1`, id).Scan(&email, &role, &name, &branchID, &warehouseID, &token, &status, &expires)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Invite not found")
		return
	}
	if status != "pending" || time.Now().After(expires) {
		writeErr(w, http.StatusConflict, "This invite is no longer open")
		return
	}
	if user.Role == "store_manager" && branchID != branchOf(user) {
		writeErr(w, http.StatusForbidden, "Not your branch invite")
		return
	}

	workspace := "Bangladesh HQ"
	if branchID != "" {
		_ = s.DB.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, branchID).Scan(&workspace)
	}
	if role == "warehouse_staff" && warehouseID != "" {
		_ = s.DB.QueryRow(ctx, `SELECT name FROM warehouses WHERE id=$1`, warehouseID).Scan(&workspace)
	}
	if role == "inventory_manager" {
		workspace = "Supply Chain HQ"
	}

	inviteURL := appBaseURL() + "/invite/" + token
	mail := sendInviteEmail(email, name, inviteRoleLabels[role], user.Name, inviteURL, workspace)
	_, _ = s.DB.Exec(ctx, `UPDATE invites SET email_status=$2, email_error=$3 WHERE id=$1`, id, mail.Status, mail.Error)
	writeJSON(w, http.StatusOK, map[string]any{
		"id": id, "inviteUrl": inviteURL, "emailStatus": mail.Status, "emailError": mail.Error,
		"message": inviteDeliveryMessage(mail.Status),
	})
}

func (s *Server) revokeInvite(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "store_manager" {
		writeErr(w, http.StatusForbidden, "Not allowed")
		return
	}
	id := r.PathValue("id")
	ctx := r.Context()
	var branchID, status string
	err := s.DB.QueryRow(ctx, `SELECT COALESCE(branch_id,''), status FROM invites WHERE id=$1`, id).Scan(&branchID, &status)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Invite not found")
		return
	}
	if user.Role == "store_manager" && branchID != branchOf(user) {
		writeErr(w, http.StatusForbidden, "Not your branch invite")
		return
	}
	if status != "pending" {
		writeErr(w, http.StatusConflict, "Invite is already closed")
		return
	}
	_, err = s.DB.Exec(ctx, `UPDATE invites SET status='revoked' WHERE id=$1`, id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not revoke invite")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "revoked"})
}

func (s *Server) getInviteByToken(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.PathValue("token"))
	if token == "" {
		writeErr(w, http.StatusBadRequest, "Missing invite token")
		return
	}
	ctx := r.Context()
	var id, email, role, title, position, name, branchID, warehouseID, inviter, status string
	var expires time.Time
	err := s.DB.QueryRow(ctx, `
		SELECT id, email, role, title, position, name,
		       COALESCE(branch_id,''), COALESCE(warehouse_id,''), invited_by_name, status, expires_at
		FROM invites WHERE token=$1`, token).Scan(
		&id, &email, &role, &title, &position, &name, &branchID, &warehouseID, &inviter, &status, &expires,
	)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Invitation not found")
		return
	}
	if status != "pending" {
		writeErr(w, http.StatusConflict, "This invitation was already used or revoked")
		return
	}
	if time.Now().After(expires) {
		_, _ = s.DB.Exec(ctx, `UPDATE invites SET status='expired' WHERE id=$1`, id)
		writeErr(w, http.StatusGone, "This invitation has expired — ask HQ to resend")
		return
	}

	workspace := "Bangladesh HQ"
	branchName := ""
	if branchID != "" {
		_ = s.DB.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, branchID).Scan(&branchName)
		workspace = branchName
	}
	if role == "warehouse_staff" && warehouseID != "" {
		_ = s.DB.QueryRow(ctx, `SELECT name FROM warehouses WHERE id=$1`, warehouseID).Scan(&workspace)
	}
	if role == "inventory_manager" {
		workspace = "Supply Chain HQ"
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id": id, "email": email, "role": role, "roleLabel": inviteRoleLabels[role],
		"title": title, "position": position, "name": name,
		"branchId": branchID, "branchName": branchName, "warehouseId": warehouseID,
		"workspace": workspace, "invitedBy": inviter, "home": homeFor(role),
		"expiresAt": expires.Format("2 Jan 2006"),
	})
}

func (s *Server) acceptInvite(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token    string `json:"token"`
		Name     string `json:"name"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid signup payload")
		return
	}
	body.Token = strings.TrimSpace(body.Token)
	body.Name = strings.TrimSpace(body.Name)
	body.Phone = strings.TrimSpace(body.Phone)
	if body.Token == "" || body.Name == "" || len(body.Password) < 6 {
		writeErr(w, http.StatusBadRequest, "Name and a password of at least 6 characters are required")
		return
	}

	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not open invite")
		return
	}
	defer tx.Rollback(ctx)

	var invID, email, role, title, position, prefName, branchID, warehouseID, status string
	var expires time.Time
	err = tx.QueryRow(ctx, `
		SELECT id, email, role, title, position, name,
		       COALESCE(branch_id,''), COALESCE(warehouse_id,''), status, expires_at
		FROM invites WHERE token=$1 FOR UPDATE`, body.Token).Scan(
		&invID, &email, &role, &title, &position, &prefName, &branchID, &warehouseID, &status, &expires,
	)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Invitation not found")
		return
	}
	if status != "pending" {
		writeErr(w, http.StatusConflict, "This invitation was already used or revoked")
		return
	}
	if time.Now().After(expires) {
		_, _ = tx.Exec(ctx, `UPDATE invites SET status='expired' WHERE id=$1`, invID)
		writeErr(w, http.StatusGone, "This invitation has expired")
		return
	}

	var exists int
	_ = tx.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE email=$1`, email).Scan(&exists)
	if exists > 0 {
		writeErr(w, http.StatusConflict, "That email is already registered — sign in instead")
		return
	}

	workspace := "Bangladesh HQ"
	if branchID != "" {
		_ = tx.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, branchID).Scan(&workspace)
	}
	if role == "warehouse_staff" {
		if warehouseID == "" {
			warehouseID = "WH-BD-DHK-01"
		}
		_ = tx.QueryRow(ctx, `SELECT name FROM warehouses WHERE id=$1`, warehouseID).Scan(&workspace)
	}
	if role == "inventory_manager" {
		workspace = "Supply Chain HQ"
	}
	if title == "" {
		title = defaultTitleForRole(role, position)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.MinCost)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}

	userID := fmt.Sprintf("u-%d", time.Now().UnixNano())
	var branchVal any
	if branchID != "" {
		branchVal = branchID
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, name, initials, role, title, workspace, branch_id, phone)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
		userID, email, string(hash), body.Name, initials(body.Name), role, title, workspace, branchVal, body.Phone,
	); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}

	if role == "staff" {
		var city, manager string
		var managerUser any
		if err := tx.QueryRow(ctx, `SELECT city, manager_name, manager_user_id FROM stores WHERE id=$1`, branchID).Scan(&city, &manager, &managerUser); err != nil {
			writeErr(w, http.StatusBadRequest, "Branch missing for staff invite")
			return
		}
		if position == "" {
			position = "Cashier"
		}
		var count int
		_ = tx.QueryRow(ctx, `SELECT COUNT(*) FROM staff WHERE branch_id=$1`, branchID).Scan(&count)
		code := fmt.Sprintf("EMP-%s-%03d", strings.ToUpper(city[:min(3, len(city))]), count+1)
		if _, err := tx.Exec(ctx, `
			INSERT INTO staff (
				id, branch_id, position, employee_code, phone, address, joined, base_salary,
				bank_account, emergency_name, emergency_phone, shift_start, shift_end, off_day,
				manager_name, manager_user_id
			) VALUES ($1,$2,$3,$4,$5,'',CURRENT_DATE,$6,'Add in your profile','','','09:00','18:00',5,$7,$8)`,
			userID, branchID, position, code, body.Phone, salaryFor(position), manager, managerUser,
		); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not create staff profile")
			return
		}
	}

	if role == "store_manager" && branchID != "" {
		_, _ = tx.Exec(ctx, `
			UPDATE stores SET manager_user_id=$2, manager_name=$3 WHERE id=$1`,
			branchID, userID, body.Name)
	}

	if _, err := tx.Exec(ctx, `
		UPDATE invites SET status='accepted', accepted_at=now(), accepted_user_id=$2 WHERE id=$1`,
		invID, userID); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not close invite")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}

	created, err := s.userByID(ctx, userID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Account created but sign-in failed")
		return
	}
	session, err := s.sign(userID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Account created but sign-in failed")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusCreated, map[string]any{
		"token": session,
		"user":  created,
		"home":  homeFor(role),
	})
}

func randomToken(n int) (string, error) {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
