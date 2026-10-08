package httpapi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func riskForQty(qty int) string {
	abs := qty
	if abs < 0 {
		abs = -abs
	}
	if abs >= 40 {
		return "high"
	}
	if abs >= 10 {
		return "medium"
	}
	return "low"
}

func (s *Server) createApprovalRequest(w http.ResponseWriter, r *http.Request, user User) {
	var body struct {
		Type             string `json:"type"`
		Title            string `json:"title"`
		Reason           string `json:"reason"`
		SKU              string `json:"sku"`
		Qty              int    `json:"qty"`
		FinancialImpact  int64  `json:"financialImpact"`
		InventoryImpact  string `json:"inventoryImpact"`
		Risk             string `json:"risk"`
		POID             string `json:"poId"`
		PromotionID      string `json:"promotionId"`
		StoreID          string `json:"storeId"`
		Supplier         string `json:"supplier"`
		Destination      string `json:"destination"`
		Expected         string `json:"expected"`
		Items            int    `json:"items"`
		Value            int64  `json:"value"`
		WarehouseID      string `json:"warehouseId"`
		PromoName        string `json:"promoName"`
		PromoPeriod      string `json:"promoPeriod"`
		PromoScope       string `json:"promoScope"`
		PromoCategory    string `json:"promoCategory"`
		PromoNote        string `json:"promoNote"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "Invalid approval payload")
		return
	}
	body.Type = strings.TrimSpace(strings.ToLower(body.Type))
	body.Reason = strings.TrimSpace(body.Reason)
	if body.Reason == "" {
		writeErr(w, http.StatusBadRequest, "Add a reason for reviewers")
		return
	}

	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not open approval")
		return
	}
	defer tx.Rollback(ctx)

	aprID := fmt.Sprintf("APR-%d", time.Now().UnixNano())
	requestedAt := time.Now().Format("2 Jan 2006 · 15:04")
	branchID := branchOf(user)
	if body.StoreID != "" {
		branchID = body.StoreID
	}

	var (
		title, impact, risk string
		financial           int64
		poID, adjID, promoID *string
		payload             map[string]any
	)

	switch body.Type {
	case "inventory":
		if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "warehouse_staff" && user.Role != "store_manager" {
			writeErr(w, http.StatusForbidden, "This role cannot request stock adjustments")
			return
		}
		if body.SKU == "" || body.Qty == 0 {
			writeErr(w, http.StatusBadRequest, "SKU and quantity are required")
			return
		}
		var productID, productName string
		var price int
		if err := tx.QueryRow(ctx, `SELECT id, name, price FROM products WHERE sku=$1`, body.SKU).Scan(&productID, &productName, &price); err != nil {
			writeErr(w, http.StatusBadRequest, "Unknown SKU")
			return
		}
		locationKind := "store"
		locationID := branchOf(user)
		locationName := user.Workspace
		if user.Role == "warehouse_staff" || user.Role == "inventory_manager" || user.Role == "owner" {
			if body.StoreID != "" && strings.HasPrefix(body.StoreID, "WH-") {
				locationKind = "warehouse"
				locationID = body.StoreID
				_ = tx.QueryRow(ctx, `SELECT name FROM warehouses WHERE id=$1`, locationID).Scan(&locationName)
			} else if body.StoreID != "" {
				locationID = body.StoreID
				_ = tx.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, locationID).Scan(&locationName)
			} else if user.Role != "store_manager" {
				locationKind = "warehouse"
				locationID = "WH-BD-DHK-01"
				locationName = "Dhaka DC"
			}
		}
		if locationID == "" {
			writeErr(w, http.StatusBadRequest, "Assign a branch before adjusting stock")
			return
		}
		id := fmt.Sprintf("ADJ-%d", time.Now().UnixNano())
		adjID = &id
		if _, err := tx.Exec(ctx, `
			INSERT INTO adjustments (id, sku, reason, qty, status, store_name, store_id, product_id, location_kind)
			VALUES ($1,$2,$3,$4,'Pending approval',$5,$6,$7,$8)`,
			id, body.SKU, body.Reason, body.Qty, locationName, locationID, productID, locationKind); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not create adjustment")
			return
		}
		title = fmt.Sprintf("Stock adjustment — %s (%+d)", productName, body.Qty)
		impact = fmt.Sprintf("%+d %s at %s", body.Qty, body.SKU, locationName)
		financial = int64(price) * int64(body.Qty)
		if financial < 0 {
			financial = -financial
		}
		risk = riskForQty(body.Qty)
		payload = map[string]any{
			"sku": body.SKU, "qty": body.Qty, "productId": productID,
			"locationKind": locationKind, "locationId": locationID,
		}

	case "purchase":
		if user.Role != "owner" && user.Role != "inventory_manager" {
			writeErr(w, http.StatusForbidden, "Inventory managers raise purchase orders")
			return
		}
		if body.Supplier == "" || body.Value <= 0 {
			writeErr(w, http.StatusBadRequest, "Supplier and value are required")
			return
		}
		if body.Destination == "" {
			body.Destination = "Dhaka DC"
		}
		if body.WarehouseID == "" {
			body.WarehouseID = "WH-BD-DHK-01"
		}
		if body.Expected == "" {
			body.Expected = time.Now().Add(14 * 24 * time.Hour).Format("2 Jan 2006")
		}
		if body.Items <= 0 {
			body.Items = 1
		}
		id := fmt.Sprintf("PO-%d", time.Now().UnixNano())
		poID = &id
		if _, err := tx.Exec(ctx, `
			INSERT INTO purchase_orders (id, supplier, destination, warehouse_id, expected, status, items, value, stage)
			VALUES ($1,$2,$3,$4,$5,'pending_approval',$6,$7,1)`,
			id, body.Supplier, body.Destination, body.WarehouseID, body.Expected, body.Items, body.Value); err != nil {
			writeErr(w, http.StatusInternalServerError, "Could not create purchase order")
			return
		}
		title = fmt.Sprintf("%s — %s", id, body.Supplier)
		impact = fmt.Sprintf("+%d line items inbound", body.Items)
		financial = body.Value
		risk = "low"
		if body.Value >= 500000 {
			risk = "medium"
		}
		if body.Value >= 1500000 {
			risk = "high"
		}
		payload = map[string]any{"poId": id, "supplier": body.Supplier, "value": body.Value}

	case "price":
		if user.Role != "owner" && user.Role != "inventory_manager" && user.Role != "store_manager" {
			writeErr(w, http.StatusForbidden, "This role cannot request price / promo approvals")
			return
		}
		if body.PromotionID != "" {
			var status string
			if err := tx.QueryRow(ctx, `SELECT status FROM promotions WHERE id=$1`, body.PromotionID).Scan(&status); err != nil {
				writeErr(w, http.StatusBadRequest, "Unknown promotion")
				return
			}
			if status == "Active" {
				writeErr(w, http.StatusConflict, "Promotion is already active")
				return
			}
			promoID = &body.PromotionID
			_, _ = tx.Exec(ctx, `UPDATE promotions SET status='Pending approval' WHERE id=$1`, body.PromotionID)
			title = body.Title
			if title == "" {
				_ = tx.QueryRow(ctx, `SELECT name FROM promotions WHERE id=$1`, body.PromotionID).Scan(&title)
			}
		} else {
			if body.PromoName == "" {
				writeErr(w, http.StatusBadRequest, "Promotion name is required")
				return
			}
			id := fmt.Sprintf("PR-%d", time.Now().UnixNano())
			promoID = &id
			period := body.PromoPeriod
			if period == "" {
				period = "Pending schedule"
			}
			scope := body.PromoScope
			if scope == "" {
				scope = user.Workspace
			}
			if _, err := tx.Exec(ctx, `
				INSERT INTO promotions (id, name, status, period, scope, category, note)
				VALUES ($1,$2,'Pending approval',$3,$4,$5,$6)`,
				id, body.PromoName, period, scope, body.PromoCategory, body.PromoNote); err != nil {
				writeErr(w, http.StatusInternalServerError, "Could not create promotion")
				return
			}
			title = body.PromoName
		}
		impact = body.InventoryImpact
		if impact == "" {
			impact = "Margin / offer change"
		}
		financial = body.FinancialImpact
		risk = body.Risk
		if risk == "" {
			risk = "low"
		}
		payload = map[string]any{"promotionId": *promoID}

	case "refund":
		if user.Role != "store_manager" && user.Role != "owner" {
			writeErr(w, http.StatusForbidden, "Branch managers request refund approvals")
			return
		}
		if body.SKU == "" || body.Qty == 0 {
			writeErr(w, http.StatusBadRequest, "SKU and quantity are required")
			return
		}
		storeID := branchOf(user)
		if storeID == "" {
			writeErr(w, http.StatusBadRequest, "Branch managers need an assigned store")
			return
		}
		var productID, productName string
		var price int
		if err := tx.QueryRow(ctx, `SELECT id, name, price FROM products WHERE sku=$1`, body.SKU).Scan(&productID, &productName, &price); err != nil {
			writeErr(w, http.StatusBadRequest, "Unknown SKU")
			return
		}
		qty := body.Qty
		if qty < 0 {
			qty = -qty
		}
		title = fmt.Sprintf("Refund — %s × %d", productName, qty)
		financial = int64(price * qty)
		impact = fmt.Sprintf("+%d %s at %s", qty, body.SKU, user.Workspace)
		risk = "medium"
		if financial >= 5000 {
			risk = "high"
		}
		payload = map[string]any{
			"sku": body.SKU, "productId": productID, "qty": qty, "storeId": storeID,
		}

	case "supplier":
		if user.Role != "owner" && user.Role != "inventory_manager" {
			writeErr(w, http.StatusForbidden, "Procurement raises supplier onboarding")
			return
		}
		if body.Supplier == "" {
			writeErr(w, http.StatusBadRequest, "Supplier name is required")
			return
		}
		title = "Onboard supplier — " + body.Supplier
		impact = "New vendor master"
		risk = "high"
		payload = map[string]any{"supplier": body.Supplier}

	default:
		writeErr(w, http.StatusBadRequest, "Unsupported approval type")
		return
	}

	if body.Title != "" && body.Type != "inventory" && body.Type != "purchase" && body.Type != "refund" && body.Type != "supplier" {
		title = body.Title
	}
	raw, _ := json.Marshal(payload)
	if _, err := tx.Exec(ctx, `
		INSERT INTO approvals (
			id, type, title, requested_by, requested_at, reason, financial_impact, inventory_impact, risk, status,
			po_id, adjustment_id, promotion_id, requester_user_id, branch_id, payload
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10,$11,$12,$13,$14,$15)`,
		aprID, body.Type, title, user.Name, requestedAt, body.Reason, financial, impact, risk,
		poID, adjID, promoID, user.ID, nullIfEmpty(branchID), raw,
	); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not open approval")
		return
	}
	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not open approval")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusCreated, map[string]any{"id": aprID, "type": body.Type, "title": title})
}

func nullIfEmpty(v string) any {
	if v == "" {
		return nil
	}
	return v
}

func (s *Server) decideApproval(w http.ResponseWriter, r *http.Request, user User) {
	if user.Role != "owner" && user.Role != "inventory_manager" {
		writeErr(w, http.StatusForbidden, "Owners and inventory managers decide approvals")
		return
	}
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || (body.Status != "approved" && body.Status != "declined") {
		writeErr(w, http.StatusBadRequest, "Approve or reject the request")
		return
	}
	id := r.PathValue("id")
	ctx := r.Context()
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not update approval")
		return
	}
	defer tx.Rollback(ctx)

	var kind string
	var poPtr, adjPtr, promoPtr *string
	var payload []byte
	err = tx.QueryRow(ctx, `
		SELECT type, po_id, adjustment_id, promotion_id, payload
		FROM approvals WHERE id=$1 AND status='pending'`, id).Scan(&kind, &poPtr, &adjPtr, &promoPtr, &payload)
	if err != nil {
		writeErr(w, http.StatusNotFound, "Approval is no longer pending")
		return
	}
	data := map[string]any{}
	_ = json.Unmarshal(payload, &data)

	if _, err := tx.Exec(ctx, `
		UPDATE approvals SET status=$2, decided_by=$3, decided_at=now() WHERE id=$1`,
		id, body.Status, user.Name); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not update approval")
		return
	}

	if body.Status == "declined" {
		if adjPtr != nil {
			_, _ = tx.Exec(ctx, `UPDATE adjustments SET status='Declined' WHERE id=$1`, *adjPtr)
		}
		if poPtr != nil {
			_, _ = tx.Exec(ctx, `UPDATE purchase_orders SET status='declined', stage=0 WHERE id=$1`, *poPtr)
		}
		if promoPtr != nil {
			_, _ = tx.Exec(ctx, `UPDATE promotions SET status='Declined' WHERE id=$1`, *promoPtr)
		}
	} else {
		switch kind {
		case "inventory":
			if err := applyInventoryApproval(ctx, tx, adjPtr, data); err != nil {
				writeErr(w, http.StatusConflict, err.Error())
				return
			}
		case "purchase":
			poID := ""
			if poPtr != nil {
				poID = *poPtr
			}
			if poID == "" {
				if v, ok := data["poId"].(string); ok {
					poID = v
				}
			}
			if poID != "" {
				_, _ = tx.Exec(ctx, `UPDATE purchase_orders SET status='supplier_confirmed', stage=3 WHERE id=$1`, poID)
			}
		case "price":
			promoID := ""
			if promoPtr != nil {
				promoID = *promoPtr
			}
			if promoID == "" {
				if v, ok := data["promotionId"].(string); ok {
					promoID = v
				}
			}
			if promoID != "" {
				_, _ = tx.Exec(ctx, `UPDATE promotions SET status='Active' WHERE id=$1`, promoID)
			}
		case "refund":
			if err := applyRefundApproval(ctx, tx, data); err != nil {
				writeErr(w, http.StatusConflict, err.Error())
				return
			}
		case "supplier":
			// Vendor master approval is recorded on the approval itself.
		}
	}

	if err := tx.Commit(ctx); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not update approval")
		return
	}
	invalidateSnapshot()
	writeJSON(w, http.StatusOK, map[string]string{"status": body.Status, "type": kind})
}

func applyInventoryApproval(ctx context.Context, tx pgx.Tx, adjPtr *string, data map[string]any) error {
	var sku, productID, locationKind, locationID, storeName string
	var qty int
	if adjPtr != nil {
		err := tx.QueryRow(ctx, `
			SELECT sku, COALESCE(product_id,''), qty, COALESCE(store_id,''), COALESCE(location_kind,'store'), store_name
			FROM adjustments WHERE id=$1`, *adjPtr).Scan(&sku, &productID, &qty, &locationID, &locationKind, &storeName)
		if err != nil {
			return fmt.Errorf("Adjustment record missing")
		}
		_, _ = tx.Exec(ctx, `UPDATE adjustments SET status='Posted' WHERE id=$1`, *adjPtr)
	} else {
		sku, _ = data["sku"].(string)
		productID, _ = data["productId"].(string)
		locationKind, _ = data["locationKind"].(string)
		locationID, _ = data["locationId"].(string)
		if q, ok := data["qty"].(float64); ok {
			qty = int(q)
		}
	}
	if productID == "" && sku != "" {
		_ = tx.QueryRow(ctx, `SELECT id FROM products WHERE sku=$1`, sku).Scan(&productID)
	}
	if productID == "" || locationID == "" {
		return fmt.Errorf("Adjustment is missing product or location")
	}
	if locationKind == "" {
		locationKind = "store"
	}
	if storeName == "" {
		storeName = locationID
	}
	tag, err := tx.Exec(ctx, `
		UPDATE stock SET on_hand = GREATEST(on_hand + $4, 0),
			status = CASE
				WHEN GREATEST(on_hand + $4, 0) <= 0 THEN 'out'
				WHEN target > 0 AND GREATEST(on_hand + $4, 0) < target THEN 'low'
				ELSE 'healthy'
			END
		WHERE product_id=$1 AND location_kind=$2 AND location_id=$3`,
		productID, locationKind, locationID, qty)
	if err != nil {
		return fmt.Errorf("Could not apply stock change")
	}
	if tag.RowsAffected() == 0 {
		short := storeName
		if parts := strings.Fields(storeName); len(parts) > 0 {
			short = parts[0]
		}
		onHand := qty
		if onHand < 0 {
			onHand = 0
		}
		status := "healthy"
		if onHand <= 0 {
			status = "out"
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO stock (id, product_id, location_kind, location_id, location_name, on_hand, reserved, in_transit, target, status)
			VALUES ($1,$2,$3,$4,$5,$6,0,0,10,$7)`,
			fmt.Sprintf("stk-%s-%s", locationID, productID), productID, locationKind, locationID, short, onHand, status)
		if err != nil {
			return fmt.Errorf("Could not create stock row")
		}
	}
	return nil
}

func applyRefundApproval(ctx context.Context, tx pgx.Tx, data map[string]any) error {
	productID, _ := data["productId"].(string)
	storeID, _ := data["storeId"].(string)
	sku, _ := data["sku"].(string)
	qty := 1
	if q, ok := data["qty"].(float64); ok {
		qty = int(q)
	}
	if productID == "" && sku != "" {
		_ = tx.QueryRow(ctx, `SELECT id FROM products WHERE sku=$1`, sku).Scan(&productID)
	}
	if productID == "" || storeID == "" {
		return fmt.Errorf("Refund is missing product or store")
	}
	var storeName string
	_ = tx.QueryRow(ctx, `SELECT name FROM stores WHERE id=$1`, storeID).Scan(&storeName)
	short := storeName
	if parts := strings.Fields(storeName); len(parts) > 0 {
		short = parts[0]
	}
	tag, err := tx.Exec(ctx, `
		UPDATE stock SET on_hand = on_hand + $3,
			status = CASE WHEN on_hand + $3 <= 0 THEN 'out' WHEN target > 0 AND on_hand + $3 < target THEN 'low' ELSE 'healthy' END
		WHERE product_id=$1 AND location_kind='store' AND location_id=$2`, productID, storeID, qty)
	if err != nil {
		return fmt.Errorf("Could not restock refund")
	}
	if tag.RowsAffected() == 0 {
		_, err = tx.Exec(ctx, `
			INSERT INTO stock (id, product_id, location_kind, location_id, location_name, on_hand, reserved, in_transit, target, status)
			VALUES ($1,$2,'store',$3,$4,$5,0,0,10,'low')`,
			fmt.Sprintf("stk-%s-%s", storeID, productID), productID, storeID, short, qty)
		if err != nil {
			return fmt.Errorf("Could not create refund stock row")
		}
	}
	return nil
}

func loadApprovalRows(ctx context.Context, db *pgxpool.Pool, pendingOnly bool) ([]map[string]any, error) {
	q := `
		SELECT id, type, title, requested_by, requested_at, reason, financial_impact, inventory_impact, risk, status,
		       COALESCE(po_id,''), COALESCE(adjustment_id,''), COALESCE(promotion_id,''),
		       COALESCE(requester_user_id,''), COALESCE(branch_id,''), COALESCE(decided_by,''),
		       COALESCE(to_char(decided_at, 'DD Mon YYYY · HH24:MI'),''), COALESCE(payload::text,'{}')
		FROM approvals`
	if pendingOnly {
		q += ` WHERE status='pending' ORDER BY requested_at DESC, id DESC`
	} else {
		q += ` WHERE status <> 'pending' ORDER BY decided_at DESC NULLS LAST, id DESC LIMIT 40`
	}
	rows, err := db.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, kind, title, by, at, reason, impact, risk, status string
		var poID, adjID, promoID, requesterID, branchID, decidedBy, decidedAt, payload string
		var financial int64
		if err := rows.Scan(&id, &kind, &title, &by, &at, &reason, &financial, &impact, &risk, &status,
			&poID, &adjID, &promoID, &requesterID, &branchID, &decidedBy, &decidedAt, &payload); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "type": kind, "title": title, "requestedBy": by, "date": at,
			"reason": reason, "financialImpact": financial, "inventoryImpact": impact, "risk": risk,
			"status": status, "poId": poID, "adjustmentId": adjID, "promotionId": promoID,
			"requesterUserId": requesterID, "branchId": branchID, "decidedBy": decidedBy, "decidedAt": decidedAt,
			"payload": json.RawMessage(payload),
		})
	}
	return list, rows.Err()
}

func approvalStats(pending []map[string]any) map[string]int {
	stats := map[string]int{
		"inventory": 0, "purchase": 0, "price": 0, "refund": 0, "supplier": 0, "total": len(pending),
	}
	for _, item := range pending {
		kind, _ := item["type"].(string)
		stats[kind]++
	}
	return stats
}
