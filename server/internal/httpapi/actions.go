package httpapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) staffBundle(w http.ResponseWriter, r *http.Request, user User) {
	ctx := r.Context()
	where := ""
	args := []any{}
	switch user.Role {
	case "owner", "inventory_manager":
	case "store_manager", "staff":
		if branchOf(user) == "" {
			writeErr(w, http.StatusForbidden, "No branch is assigned to this account")
			return
		}
		where = "WHERE st.branch_id = $1"
		args = append(args, branchOf(user))
	default:
		writeErr(w, http.StatusForbidden, "Staff records are not part of this role")
		return
	}
	rows, err := s.DB.Query(ctx, `
		SELECT st.id, u.email, u.name, u.initials, st.branch_id, s.name, s.city, st.position, st.employee_code,
		       st.phone, st.address, st.joined::text, st.base_salary, st.bank_account, st.emergency_name,
		       st.emergency_phone, st.shift_start, st.shift_end, st.off_day, st.manager_name
		FROM staff st
		JOIN users u ON u.id = st.id
		JOIN stores s ON s.id = st.branch_id
		`+where+`
		ORDER BY s.name, u.name`, args...)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not load staff")
		return
	}
	defer rows.Close()
	directory := []map[string]any{}
	ids := []string{}
	for rows.Next() {
		var id, email, name, initials, branchID, workspace, city, position, code, phone, address, joined, bank, emergencyName, emergencyPhone, shiftStart, shiftEnd, manager string
		var salary, offDay int
		if err := rows.Scan(&id, &email, &name, &initials, &branchID, &workspace, &city, &position, &code, &phone, &address, &joined, &salary, &bank, &emergencyName, &emergencyPhone, &shiftStart, &shiftEnd, &offDay, &manager); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not load staff")
			return
		}
		ids = append(ids, id)
		directory = append(directory, map[string]any{
			"id": id, "email": email, "name": name, "initials": initials, "branchId": branchID,
			"workspace": workspace, "city": city, "position": position, "employeeCode": code,
			"phone": phone, "address": address, "joined": joined, "baseSalary": salary,
			"bankAccount": bank, "emergencyName": emergencyName, "emergencyPhone": emergencyPhone,
			"shiftStart": shiftStart, "shiftEnd": shiftEnd, "offDay": offDay, "managerName": manager,
		})
	}
	punches := []map[string]any{}
	leaves := []map[string]any{}
	if len(ids) > 0 {
		prows, err := s.DB.Query(ctx, `SELECT id, staff_id, type, at FROM punches WHERE staff_id = ANY($1) ORDER BY at`, ids)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not load attendance")
			return
		}
		defer prows.Close()
		for prows.Next() {
			var id, staffID, kind string
			var at time.Time
			if err := prows.Scan(&id, &staffID, &kind, &at); err != nil {
				writeErr(w, http.StatusInternalServerError, "Could not load attendance")
				return
			}
			punches = append(punches, map[string]any{"id": id, "staffId": staffID, "type": kind, "at": at.Format(time.RFC3339)})
		}
		lrows, err := s.DB.Query(ctx, `SELECT id, staff_id, kind, from_date::text, to_date::text, reason, status FROM leaves WHERE staff_id = ANY($1) ORDER BY from_date DESC`, ids)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not load leave")
			return
		}
		defer lrows.Close()
		for lrows.Next() {
			var id, staffID, kind, from, to, reason, status string
			if err := lrows.Scan(&id, &staffID, &kind, &from, &to, &reason, &status); err != nil {
				writeErr(w, http.StatusInternalServerError, "Could not load leave")
				return
			}
			leaves = append(leaves, map[string]any{"id": id, "staffId": staffID, "kind": kind, "from": from, "to": to, "reason": reason, "status": status})
		}
	}
	writeJSON(w, http.StatusOK, map[string]any{"directory": directory, "punches": punches, "leaves": leaves})
}

func (s *Server) clock(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "staff" {
		writeErr(w, http.StatusForbidden, "Only branch staff can clock in")
		return
	}
	var body struct {
		Type string `json:"type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid clock payload")
		return
	}
	switch body.Type {
	case "in", "out", "break_start", "break_end":
	default:
		writeErr(w, http.StatusBadRequest, "Unknown clock action")
		return
	}
	id := fmt.Sprintf("%s-%s-%d", user.ID, body.Type, time.Now().UnixNano())
	if _, err := s.DB.Exec(r.Context(), `INSERT INTO punches (id, staff_id, type, at) VALUES ($1,$2,$3,now())`, id, user.ID, body.Type); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save punch")
		return
	}
	invalidateSnapshot()
	s.staffBundle(w, r, user)
}

func (s *Server) updateProfile(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "staff" {
		writeErr(w, http.StatusForbidden, "Only staff can edit this profile")
		return
	}
	var body struct {
		Phone          string `json:"phone"`
		Address        string `json:"address"`
		BankAccount    string `json:"bankAccount"`
		EmergencyName  string `json:"emergencyName"`
		EmergencyPhone string `json:"emergencyPhone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid profile")
		return
	}
	if _, err := s.DB.Exec(r.Context(), `
		UPDATE staff SET phone=$2, address=$3, bank_account=$4, emergency_name=$5, emergency_phone=$6 WHERE id=$1`,
		user.ID, body.Phone, body.Address, body.BankAccount, body.EmergencyName, body.EmergencyPhone); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save profile")
		return
	}
	_, _ = s.DB.Exec(r.Context(), `UPDATE users SET phone=$2 WHERE id=$1`, user.ID, body.Phone)
	invalidateSnapshot()
	s.staffBundle(w, r, user)
}

func (s *Server) requestLeave(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "staff" {
		writeErr(w, http.StatusForbidden, "Only staff can request leave")
		return
	}
	var body struct {
		Kind   string `json:"kind"`
		From   string `json:"from"`
		To     string `json:"to"`
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid leave request")
		return
	}
	if body.From == "" || body.To == "" || body.To < body.From || strings.TrimSpace(body.Reason) == "" {
		writeErr(w, http.StatusBadRequest, "Choose dates and a reason for your manager")
		return
	}
	id := fmt.Sprintf("lv-%d", time.Now().UnixNano())
	if _, err := s.DB.Exec(r.Context(), `
		INSERT INTO leaves (id, staff_id, kind, from_date, to_date, reason, status)
		VALUES ($1,$2,$3,$4,$5,$6,'pending')`, id, user.ID, body.Kind, body.From, body.To, strings.TrimSpace(body.Reason)); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save leave")
		return
	}
	invalidateSnapshot()
	s.staffBundle(w, r, user)
}

func (s *Server) reviewLeave(w http.ResponseWriter, r *http.Request, user User) {
	if !isManager(user) {
		writeErr(w, http.StatusForbidden, "Branch managers and owners review leave")
		return
	}
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || (body.Status != "approved" && body.Status != "declined") {
		writeErr(w, http.StatusBadRequest, "Approve or decline the request")
		return
	}
	id := r.PathValue("id")
	var branchID string
	err := s.DB.QueryRow(r.Context(), `SELECT st.branch_id FROM leaves l JOIN staff st ON st.id=l.staff_id WHERE l.id=$1`, id).Scan(&branchID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Leave request not found")
		return
	}
	if user.Role == "store_manager" && branchOf(user) != branchID {
		writeErr(w, http.StatusForbidden, "This employee is on another branch")
		return
	}
	if _, err := s.DB.Exec(r.Context(), `UPDATE leaves SET status=$2 WHERE id=$1`, id, body.Status); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not update leave")
		return
	}
	invalidateSnapshot()
	s.staffBundle(w, r, user)
}

func (s *Server) signup(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name, Email, Password, Phone, Address, Position, BranchID, EmergencyName, EmergencyPhone string
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid signup")
		return
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))
	body.Name = strings.TrimSpace(body.Name)
	if body.Name == "" || body.Email == "" || len(body.Password) < 6 || body.BranchID == "" || body.Position == "" {
		writeErr(w, http.StatusBadRequest, "Fill in name, email, password, branch, and position")
		return
	}
	ctx := r.Context()
	var storeName, city, manager string
	var managerUser any
	if err := s.DB.QueryRow(ctx, `SELECT name, city, manager_name, manager_user_id FROM stores WHERE id=$1`, body.BranchID).Scan(&storeName, &city, &manager, &managerUser); err != nil {
		writeErr(w, http.StatusBadRequest, "Choose a branch")
		return
	}
	var exists int
	_ = s.DB.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE email=$1`, body.Email).Scan(&exists)
	if exists > 0 {
		writeErr(w, http.StatusConflict, "That email is already registered")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.MinCost)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	id := fmt.Sprintf("st-%d", time.Now().UnixNano())
	salary := salaryFor(body.Position)
	var count int
	_ = s.DB.QueryRow(ctx, `SELECT COUNT(*) FROM staff WHERE branch_id=$1`, body.BranchID).Scan(&count)
	code := fmt.Sprintf("EMP-%s-%03d", strings.ToUpper(city[:min(3, len(city))]), count+1)
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	defer tx.Rollback(ctx)
	if _, err := tx.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, name, initials, role, title, workspace, branch_id, phone)
		VALUES ($1,$2,$3,$4,$5,'staff',$6,$7,$8,$9)`,
		id, body.Email, string(hash), body.Name, initials(body.Name), body.Position, storeName, body.BranchID, body.Phone); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO staff (id, branch_id, position, employee_code, phone, address, joined, base_salary, bank_account, emergency_name, emergency_phone, shift_start, shift_end, off_day, manager_name, manager_user_id)
		VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE,$7,'Add in your profile',$8,$9,'09:00','18:00',5,$10,$11)`,
		id, body.BranchID, body.Position, code, body.Phone, body.Address, salary, body.EmergencyName, body.EmergencyPhone, manager, managerUser); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create staff profile")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	user, err := s.userByID(ctx, id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Account created but sign-in failed")
		return
	}
	token, _ := s.sign(id)
	writeJSON(w, http.StatusCreated, map[string]any{"token": token, "user": user, "home": "/staff"})
}

func (s *Server) checkout(w http.ResponseWriter, r *http.Request, user User) {
	var body struct {
		StoreID string `json:"storeId"`
		Tender  string `json:"tender"`
		Lines   []struct {
			ProductID string `json:"productId"`
			Qty       int    `json:"qty"`
		} `json:"lines"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || len(body.Lines) == 0 {
		writeErr(w, http.StatusBadRequest, "Add at least one item")
		return
	}
	storeID := body.StoreID
	if storeID == "" {
		storeID = branchOf(user)
	}
	if storeID == "" {
		storeID = "MIN-BD-DHK-014"
	}
	if body.Tender == "" {
		body.Tender = "card"
	}
	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not start sale")
		return
	}
	defer tx.Rollback(ctx)
	saleID := fmt.Sprintf("SAL-%d", time.Now().UnixNano())
	total := 0
	if _, err := tx.Exec(ctx, `INSERT INTO sales (id, store_id, user_id, total, tender) VALUES ($1,$2,$3,0,$4)`, saleID, storeID, user.ID, body.Tender); err != nil {
		writeErr(w, http.StatusBadRequest, "This branch cannot take the sale")
		return
	}
	for i, line := range body.Lines {
		if line.Qty <= 0 {
			continue
		}
		var price, onHand, target int
		err := tx.QueryRow(ctx, `
			SELECT p.price, st.on_hand, st.target
			FROM stock st JOIN products p ON p.id = st.product_id
			WHERE st.product_id=$1 AND st.location_kind='store' AND st.location_id=$2
			FOR UPDATE`, line.ProductID, storeID).Scan(&price, &onHand, &target)
		if err == pgx.ErrNoRows || onHand < line.Qty {
			writeErr(w, http.StatusConflict, "Not enough stock at this branch")
			return
		}
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not check stock")
			return
		}
		newQty := onHand - line.Qty
		if _, err := tx.Exec(ctx, `
			UPDATE stock SET on_hand=$3, status=$4
			WHERE product_id=$1 AND location_kind='store' AND location_id=$2`,
			line.ProductID, storeID, newQty, statusFor(newQty, target)); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not update stock")
			return
		}
		if _, err := tx.Exec(ctx, `INSERT INTO sale_lines (id, sale_id, product_id, qty, price) VALUES ($1,$2,$3,$4,$5)`,
			fmt.Sprintf("%s-%d", saleID, i), saleID, line.ProductID, line.Qty, price); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not save line")
			return
		}
		_, _ = tx.Exec(ctx, `UPDATE products SET units_sold_30d = units_sold_30d + $2, revenue_30d = revenue_30d + $3 WHERE id=$1`, line.ProductID, line.Qty, line.Qty*price)
		total += line.Qty * price
	}
	if _, err := tx.Exec(ctx, `
		UPDATE stores SET
		  sales_today = sales_today + $2,
		  transactions = transactions + 1,
		  avg_basket = CASE WHEN transactions + 1 = 0 THEN $2 ELSE ((sales_today + $2) / (transactions + 1)) END
		WHERE id=$1`, storeID, total); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not update branch sales")
		return
	}
	if _, err := tx.Exec(ctx, `UPDATE sales SET total=$2 WHERE id=$1`, saleID, total); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not finish sale")
		return
	}
	hour := time.Now().Hour() % 10
	_, _ = tx.Exec(ctx, `
		INSERT INTO hourly_sales (store_id, hour, amount) VALUES ($1,$2,$3)
		ON CONFLICT (store_id, hour) DO UPDATE SET amount = hourly_sales.amount + EXCLUDED.amount`,
		storeID, hour, total)
	_, _ = tx.Exec(ctx, `UPDATE series_points SET value = value + 1 WHERE name='sales' AND idx = (SELECT MAX(idx) FROM series_points WHERE name='sales')`)
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not commit sale")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusOK, map[string]any{"id": saleID, "total": total})
}

func (s *Server) createTransfer(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "warehouse_staff" && user.Role != "store_manager" {
		writeErr(w, http.StatusForbidden, "This role cannot move stock")
		return
	}
	var body struct {
		ToStoreID string `json:"toStoreId"`
		SKU       string `json:"sku"`
		Qty       int    `json:"qty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Qty <= 0 || body.SKU == "" || body.ToStoreID == "" {
		writeErr(w, http.StatusBadRequest, "Choose a branch, SKU, and quantity")
		return
	}
	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create transfer")
		return
	}
	defer tx.Rollback(ctx)
	var productID, storeName string
	if err := tx.QueryRow(ctx, `SELECT id FROM products WHERE sku=$1`, body.SKU).Scan(&productID); err != nil {
		writeErr(w, http.StatusBadRequest, "Unknown SKU")
		return
	}
	if err := tx.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, body.ToStoreID).Scan(&storeName); err != nil {
		writeErr(w, http.StatusBadRequest, "Unknown branch")
		return
	}
	tag, err := tx.Exec(ctx, `
		UPDATE stock SET on_hand = on_hand - $2
		WHERE product_id=$1 AND location_kind='warehouse' AND location_id='WH-BD-DHK-01' AND on_hand >= $2`, productID, body.Qty)
	if err != nil || tag.RowsAffected() == 0 {
		writeErr(w, http.StatusConflict, "Dhaka DC does not have enough of that SKU")
		return
	}
	_, _ = tx.Exec(ctx, `
		INSERT INTO stock (id, product_id, location_kind, location_id, location_name, on_hand, reserved, in_transit, target, status)
		VALUES ($1,$2,'store',$3,$4,0,0,$5,10,'transit')
		ON CONFLICT (product_id, location_kind, location_id)
		DO UPDATE SET in_transit = stock.in_transit + EXCLUDED.in_transit`,
		"stk-tr-"+productID+"-"+body.ToStoreID, productID, body.ToStoreID, strings.Split(storeName, " ")[0], body.Qty)
	id := fmt.Sprintf("TR-%d", time.Now().UnixNano())
	if _, err := tx.Exec(ctx, `
		INSERT INTO transfers (id, from_name, to_name, from_kind, from_id, to_kind, to_id, product_id, sku, qty, status)
		VALUES ($1,'Dhaka DC',$2,'warehouse','WH-BD-DHK-01','store',$3,$4,$5,$6,'In Transit')`,
		id, storeName, body.ToStoreID, productID, body.SKU, body.Qty); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save transfer")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save transfer")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) receiveTransfer(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role == "staff" || user.Role == "social_media" {
		writeErr(w, http.StatusForbidden, "This role cannot receive transfers")
		return
	}
	id := r.PathValue("id")
	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not receive transfer")
		return
	}
	defer tx.Rollback(ctx)
	var productID, toID, status string
	var qty int
	err = tx.QueryRow(ctx, `SELECT product_id, to_id, qty, status FROM transfers WHERE id=$1`, id).Scan(&productID, &toID, &qty, &status)
	if err != nil || status != "In Transit" {
		writeErr(w, http.StatusBadRequest, "Transfer is not in transit")
		return
	}
	tag, err := tx.Exec(ctx, `
		UPDATE stock SET in_transit = GREATEST(in_transit - $3, 0), on_hand = on_hand + $3
		WHERE product_id=$1 AND location_kind='store' AND location_id=$2`, productID, toID, qty)
	if err != nil || tag.RowsAffected() == 0 {
		writeErr(w, http.StatusConflict, "Branch stock record is missing")
		return
	}
	_, _ = tx.Exec(ctx, `UPDATE stock SET status = CASE WHEN on_hand <= 0 THEN 'out' WHEN target > 0 AND on_hand < target THEN 'low' ELSE 'healthy' END WHERE product_id=$1 AND location_kind='store' AND location_id=$2`, productID, toID)
	if _, err := tx.Exec(ctx, `UPDATE transfers SET status='Completed' WHERE id=$1`, id); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not receive transfer")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not receive transfer")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusOK, map[string]string{"status": "Completed"})
}

func (s *Server) createAdjustment(w http.ResponseWriter, r *http.Request, user User) {
	// Compatibility wrapper — adjustments always open a real inventory approval.
	var body struct {
		SKU     string `json:"sku"`
		Qty     int    `json:"qty"`
		Reason  string `json:"reason"`
		StoreID string `json:"storeId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "SKU and quantity are required")
		return
	}
	raw, _ := json.Marshal(map[string]any{
		"type": "inventory", "sku": body.SKU, "qty": body.Qty, "reason": body.Reason, "storeId": body.StoreID,
	})
	r.Body = io.NopCloser(strings.NewReader(string(raw)))
	s.createApprovalRequest(w, r, user)
}

func (s *Server) createShipment(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" {
		writeErr(w, http.StatusForbidden, "Inventory managers create shipments")
		return
	}
	var body struct {
		Origin  string `json:"origin"`
		Invoice string `json:"invoice"`
		ETA     string `json:"eta"`
		Items   int    `json:"items"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Origin == "" {
		writeErr(w, http.StatusBadRequest, "Origin is required")
		return
	}
	if body.Items <= 0 {
		body.Items = 1
	}
	id := fmt.Sprintf("SHP-%d", time.Now().UnixNano())
	_, err := s.DB.Exec(r.Context(), `
		INSERT INTO shipments (id, origin, invoice, eta, status, items, warehouse_id, qty)
		VALUES ($1,$2,$3,$4,'In Transit',$5,'WH-BD-DHK-01',$5)`,
		id, body.Origin, body.Invoice, body.ETA, body.Items)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not create shipment")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}

func (s *Server) receiveShipment(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "warehouse_staff" && user.Role != "inventory_manager" && user.Role != "owner" {
		writeErr(w, http.StatusForbidden, "Warehouse receives inbound shipments")
		return
	}
	id := r.PathValue("id")
	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not receive shipment")
		return
	}
	defer tx.Rollback(ctx)
	var productID *string
	var qty int
	var status, warehouseID string
	err = tx.QueryRow(ctx, `SELECT product_id, qty, status, COALESCE(warehouse_id,'WH-BD-DHK-01') FROM shipments WHERE id=$1`, id).Scan(&productID, &qty, &status, &warehouseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Shipment not found")
		return
	}
	if status == "Received" {
		writeErr(w, http.StatusBadRequest, "Shipment is already received")
		return
	}
	if _, err := tx.Exec(ctx, `UPDATE shipments SET status='Received' WHERE id=$1`, id); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not receive shipment")
		return
	}
	if productID != nil && qty > 0 {
		_, _ = tx.Exec(ctx, `
			UPDATE stock SET on_hand = on_hand + $3, in_transit = GREATEST(in_transit - $3, 0), status='healthy'
			WHERE product_id=$1 AND location_kind='warehouse' AND location_id=$2`, *productID, warehouseID, qty)
	}
	_, _ = tx.Exec(ctx, `UPDATE warehouse_tasks SET status='completed' WHERE ref=$1`, id)
	_, _ = tx.Exec(ctx, `UPDATE warehouses SET inbound = GREATEST(inbound - 1, 0) WHERE id=$1`, warehouseID)
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not receive shipment")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusOK, map[string]string{"status": "Received"})
}

func (s *Server) toggleOperation(w http.ResponseWriter, r *http.Request, user User) {
	id := r.PathValue("id")
	var storeID string
	if err := s.DB.QueryRow(r.Context(), `SELECT store_id FROM operation_tasks WHERE id=$1`, id).Scan(&storeID); err != nil {
		writeErr(w, http.StatusNotFound, "Task not found")
		return
	}
	if user.Role == "store_manager" && branchOf(user) != storeID {
		writeErr(w, http.StatusForbidden, "This checklist belongs to another branch")
		return
	}
	if _, err := s.DB.Exec(r.Context(), `UPDATE operation_tasks SET done = NOT done WHERE id=$1`, id); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not update checklist")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusOK, map[string]string{"ok": "true"})
}

func salaryFor(position string) int {
	switch position {
	case "Cashier":
		return 26000
	case "Visual Merchandiser":
		return 30000
	case "Stock Associate":
		return 24000
	case "Customer Care":
		return 25000
	default:
		return 22000
	}
}

func initials(name string) string {
	out := ""
	for _, part := range strings.Fields(name) {
		out += strings.ToUpper(part[:1])
		if len(out) == 2 {
			break
		}
	}
	return out
}

func statusFor(onHand, target int) string {
	if onHand <= 0 {
		return "out"
	}
	if target > 0 && onHand*5 <= target {
		return "critical"
	}
	if target > 0 && onHand < target {
		return "low"
	}
	return "healthy"
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
