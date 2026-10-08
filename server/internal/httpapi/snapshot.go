package httpapi

import (
	"context"
	"net/http"
	"sync"
	"time"
)

var snapCache struct {
	sync.Mutex
	gen   int
	items map[string]struct {
		gen  int
		at   time.Time
		data map[string]any
	}
}

func init() {
	snapCache.items = map[string]struct {
		gen  int
		at   time.Time
		data map[string]any
	}{}
}

func invalidateSnapshot() {
	snapCache.Lock()
	snapCache.gen++
	snapCache.Unlock()
}

func (s *Server) snapshot(w http.ResponseWriter, r *http.Request, user User) {
	key := branchOf(user)
	if key == "" {
		key = "network"
	}
	snapCache.Lock()
	if item, ok := snapCache.items[key]; ok && item.gen == snapCache.gen && time.Since(item.at) < 20*time.Second {
		data := item.data
		snapCache.Unlock()
		writeJSON(w, http.StatusOK, data)
		return
	}
	gen := snapCache.gen
	snapCache.Unlock()

	payload, err := s.buildSnapshot(r.Context(), user)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not load retail data")
		return
	}
	snapCache.Lock()
	if gen == snapCache.gen {
		snapCache.items[key] = struct {
			gen  int
			at   time.Time
			data map[string]any
		}{gen: gen, at: time.Now(), data: payload}
	}
	snapCache.Unlock()
	writeJSON(w, http.StatusOK, payload)
}

func (s *Server) buildSnapshot(ctx context.Context, user User) (map[string]any, error) {
	stores, err := s.loadStores(ctx)
	if err != nil {
		return nil, err
	}
	warehouses, err := s.loadWarehouses(ctx)
	if err != nil {
		return nil, err
	}
	products, err := s.loadProducts(ctx)
	if err != nil {
		return nil, err
	}
	inventory, err := s.loadInventory(ctx)
	if err != nil {
		return nil, err
	}
	orders, err := s.loadOrders(ctx)
	if err != nil {
		return nil, err
	}
	approvals, err := loadApprovalRows(ctx, s.DB, true)
	if err != nil {
		return nil, err
	}
	approvalHistory, err := loadApprovalRows(ctx, s.DB, false)
	if err != nil {
		return nil, err
	}
	customers, err := s.loadCustomers(ctx)
	if err != nil {
		return nil, err
	}
	conversations, err := s.loadConversations(ctx)
	if err != nil {
		return nil, err
	}
	messages, err := s.loadMessages(ctx)
	if err != nil {
		return nil, err
	}
	tasks, err := s.loadWarehouseTasks(ctx)
	if err != nil {
		return nil, err
	}
	transfers, err := s.loadTransfers(ctx)
	if err != nil {
		return nil, err
	}
	adjustments, err := s.loadAdjustments(ctx)
	if err != nil {
		return nil, err
	}
	shipments, err := s.loadShipments(ctx)
	if err != nil {
		return nil, err
	}
	promotions, err := s.loadPromotions(ctx)
	if err != nil {
		return nil, err
	}
	notes, err := s.loadNotes(ctx)
	if err != nil {
		return nil, err
	}
	ops, err := s.loadOperations(ctx, branchOf(user))
	if err != nil {
		return nil, err
	}
	salesSpark, err := s.loadSeries(ctx, "sales")
	if err != nil {
		return nil, err
	}
	inventorySpark, err := s.loadSeries(ctx, "inventory")
	if err != nil {
		return nil, err
	}
	boards, err := s.loadBoards(ctx, stores)
	if err != nil {
		return nil, err
	}

	var salesToday int64
	var inventoryValue int64
	open := 0
	for _, store := range stores {
		salesToday += int64(store["salesToday"].(int))
		if store["status"] == "operational" {
			open++
		}
	}
	if err := s.DB.QueryRow(ctx, `
		SELECT COALESCE(SUM(st.on_hand * p.cost),0)
		FROM stock st JOIN products p ON p.id = st.product_id`).Scan(&inventoryValue); err != nil {
		return nil, err
	}
	low, out := 0, 0
	for _, row := range inventory {
		switch row["status"] {
		case "low", "critical":
			low++
		case "out":
			out++
		}
	}

	regions := map[string]map[string]any{}
	for _, store := range stores {
		city := store["city"].(string)
		bucket, ok := regions[city]
		if !ok {
			bucket = map[string]any{"region": city, "stores": 0, "sales": 0, "growth": 8.0, "availability": 0.0, "alerts": 0}
			regions[city] = bucket
		}
		bucket["stores"] = bucket["stores"].(int) + 1
		bucket["sales"] = bucket["sales"].(int) + store["salesToday"].(int)
		bucket["availability"] = store["stockAvailability"]
		if raw, ok := boards[store["id"].(string)].(map[string]any); ok {
			if alerts, ok := raw["alerts"].([]map[string]any); ok {
				bucket["alerts"] = bucket["alerts"].(int) + len(alerts)
			}
		}
	}
	regionList := []map[string]any{}
	for _, bucket := range regions {
		regionList = append(regionList, bucket)
	}

	top := []map[string]any{}
	for i, store := range stores {
		if i >= 5 {
			break
		}
		top = append(top, map[string]any{
			"name":   store["name"],
			"sales":  store["salesToday"],
			"growth": 10.0,
			"rank":   i + 1,
		})
	}

	notifications := s.notifications(inventory, approvals, shipments, transfers)
	org, _ := s.loadOrg(ctx, stores)

	return map[string]any{
		"org":                org,
		"stores":             stores,
		"warehouses":         warehouses,
		"products":           products,
		"inventoryRows":      inventory,
		"purchaseOrders":     orders,
		"approvals":          approvals,
		"approvalHistory":    approvalHistory,
		"approvalStats":      approvalStats(approvals),
		"customers":          customers,
		"conversations":      conversations,
		"socialMessages":     messages,
		"warehouseTasks":     tasks,
		"transfers":          transfers,
		"adjustments":        adjustments,
		"shipments":          shipments,
		"promotions":         promotions,
		"notesByBranch":      notes,
		"storeOperations":    ops,
		"salesSparkline":     salesSpark,
		"inventorySparkline": inventorySpark,
		"branchBoards":       boards,
		"notifications":      notifications,
		"regionPerformance":  regionList,
		"topStoresBySales":   top,
		"networkStats": map[string]any{
			"stores":     len(stores),
			"warehouses": len(warehouses),
			"inventory":  inventoryValue,
			"salesToday": salesToday,
		},
		"ownerMetrics": map[string]any{
			"networkSalesToday": salesToday,
			"networkSalesChange": 12.4,
			"monthToDate":        salesToday * 20,
			"monthToDateChange":  8.1,
			"grossMargin":        54.2,
			"grossMarginChange":  0.6,
			"inventoryValue":     inventoryValue,
			"inventoryTurns":     6.4,
			"openStores":         open,
			"totalStores":        len(stores),
			"pendingApprovals":   len(approvals),
			"criticalExceptions": out + low,
			"supplierOtif":       91,
			"forecastAccuracy":   88.8,
		},
		"kpis": map[string]any{
			"salesToday":          salesToday,
			"salesChange":         12.4,
			"inventoryValue":      inventoryValue,
			"inventoryAvailable":  94.2,
			"lowStock":            low,
			"lowStockChange":      -8,
			"outOfStock":          out,
			"outOfStockChange":    -14,
			"pendingActions":      len(approvals),
		},
	}, nil
}

func (s *Server) loadStores(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `
		SELECT s.id, s.name, s.city, s.country, s.status, s.manager_name, COALESCE(s.manager_user_id,''), COALESCE(s.hq_id,''),
		       COALESCE(u.email,''), s.sales_today, s.transactions, s.avg_basket, s.stock_availability, s.sales_target,
		       (SELECT COUNT(*) FROM staff st WHERE st.branch_id = s.id),
		       (SELECT COUNT(DISTINCT p.staff_id) FROM punches p JOIN staff st ON st.id = p.staff_id
		         WHERE st.branch_id = s.id AND p.at::date = CURRENT_DATE
		           AND p.type IN ('in','break_end')
		           AND NOT EXISTS (
		             SELECT 1 FROM punches later
		             WHERE later.staff_id = p.staff_id AND later.at::date = CURRENT_DATE AND later.at > p.at AND later.type = 'out'
		           ))
		FROM stores s
		LEFT JOIN users u ON u.id = s.manager_user_id
		ORDER BY s.sales_today DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, name, city, country, status, manager, managerUserID, hqID, managerEmail string
		var sales, tx, basket, target, staffTotal, present int
		var availability float64
		if err := rows.Scan(&id, &name, &city, &country, &status, &manager, &managerUserID, &hqID, &managerEmail, &sales, &tx, &basket, &availability, &target, &staffTotal, &present); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "name": name, "city": city, "country": country, "status": status,
			"manager": manager, "managerUserId": managerUserID, "managerEmail": managerEmail, "hqId": hqID,
			"salesToday": sales, "transactions": tx, "avgBasket": basket,
			"stockAvailability": availability, "staffPresent": present, "staffTotal": staffTotal,
			"salesTarget": target,
		})
	}
	return list, rows.Err()
}

func (s *Server) loadWarehouses(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, name, city, capacity, inbound, outbound FROM warehouses ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, name, city string
		var capacity, inbound, outbound int
		if err := rows.Scan(&id, &name, &city, &capacity, &inbound, &outbound); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{"id": id, "name": name, "city": city, "capacity": capacity, "inbound": inbound, "outbound": outbound})
	}
	return list, rows.Err()
}

func (s *Server) loadProducts(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `
		SELECT p.id, p.sku, p.name, p.category, p.brand, p.price, p.cost, p.status, p.image,
		       p.units_sold_30d, p.revenue_30d, p.margin, p.sell_through, p.stock_coverage,
		       COALESCE(SUM(st.on_hand),0), COALESCE(SUM(st.in_transit),0), COALESCE(SUM(st.reserved),0),
		       COUNT(DISTINCT CASE WHEN st.location_kind='store' AND st.on_hand > 0 THEN st.location_id END)
		FROM products p
		LEFT JOIN stock st ON st.product_id = p.id
		GROUP BY p.id
		ORDER BY p.name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, sku, name, category, brand, status, image string
		var price, cost, sold, sell, coverage, available, transit, reserved, storeCount int
		var revenue int64
		var margin float64
		if err := rows.Scan(&id, &sku, &name, &category, &brand, &price, &cost, &status, &image, &sold, &revenue, &margin, &sell, &coverage, &available, &transit, &reserved, &storeCount); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "sku": sku, "name": name, "category": category, "brand": brand,
			"price": price, "cost": cost, "status": status, "image": image,
			"unitsSold30d": sold, "revenue30d": revenue, "margin": margin,
			"sellThrough": sell, "stockCoverage": coverage,
			"available": available, "inTransit": transit, "reserved": reserved, "stores": storeCount,
			"inventoryStatus": stockStatus(available),
		})
	}
	return list, rows.Err()
}

func stockStatus(available int) string {
	switch {
	case available <= 0:
		return "out"
	case available < 20:
		return "critical"
	case available < 80:
		return "low"
	default:
		return "healthy"
	}
}

func (s *Server) loadInventory(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `
		SELECT p.sku, p.name, st.location_name, st.on_hand, st.target, st.status, p.category, p.id, st.location_id
		FROM stock st JOIN products p ON p.id = st.product_id
		WHERE st.location_kind = 'store'
		ORDER BY st.on_hand ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var sku, name, store, status, category, productID, locationID string
		var onHand, target int
		if err := rows.Scan(&sku, &name, &store, &onHand, &target, &status, &category, &productID, &locationID); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"sku": sku, "name": name, "store": store, "stock": onHand, "target": target,
			"status": status, "category": category, "productId": productID, "storeId": locationID,
		})
	}
	return list, rows.Err()
}

func (s *Server) loadOrders(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, supplier, destination, expected, status, items, value, stage FROM purchase_orders ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, supplier, destination, expected, status string
		var items, stage int
		var value int64
		if err := rows.Scan(&id, &supplier, &destination, &expected, &status, &items, &value, &stage); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "supplier": supplier, "destination": destination, "expected": expected,
			"status": status, "items": items, "value": value, "stage": stage,
		})
	}
	return list, rows.Err()
}

func (s *Server) loadCustomers(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, name, phone, tier, lifetime_spend, orders, avg_basket, points FROM customers ORDER BY lifetime_spend DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, name, phone, tier string
		var spend int64
		var orders, basket, points int
		if err := rows.Scan(&id, &name, &phone, &tier, &spend, &orders, &basket, &points); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "name": name, "phone": phone, "tier": tier,
			"lifetimeSpend": spend, "orders": orders, "avgBasket": basket, "points": points,
		})
	}
	return list, rows.Err()
}

func (s *Server) loadConversations(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, channel, customer, preview, time_label, unread, ai_confidence, COALESCE(store_id,'') FROM conversations ORDER BY unread DESC, id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, channel, customer, preview, timeLabel, storeID string
		var unread bool
		var confidence int
		if err := rows.Scan(&id, &channel, &customer, &preview, &timeLabel, &unread, &confidence, &storeID); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "channel": channel, "customer": customer, "preview": preview,
			"time": timeLabel, "unread": unread, "aiConfidence": confidence, "storeId": storeID,
		})
	}
	return list, rows.Err()
}

func (s *Server) loadMessages(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, sender, text, time_label FROM social_messages WHERE conversation_id='1' ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, sender, text, timeLabel string
		if err := rows.Scan(&id, &sender, &text, &timeLabel); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{"id": id, "sender": sender, "text": text, "time": timeLabel})
	}
	return list, rows.Err()
}

func (s *Server) loadWarehouseTasks(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, type, ref, status, priority, assignee FROM warehouse_tasks ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, kind, ref, status, priority, assignee string
		if err := rows.Scan(&id, &kind, &ref, &status, &priority, &assignee); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{"id": id, "type": kind, "ref": ref, "status": status, "priority": priority, "assignee": assignee})
	}
	return list, rows.Err()
}

func (s *Server) loadTransfers(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, from_name, to_name, sku, qty, status FROM transfers ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, from, to, sku, status string
		var qty int
		if err := rows.Scan(&id, &from, &to, &sku, &qty, &status); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{"id": id, "from": from, "to": to, "sku": sku, "qty": qty, "status": status})
	}
	return list, rows.Err()
}

func (s *Server) loadAdjustments(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, sku, reason, qty, status FROM adjustments ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, sku, reason, status string
		var qty int
		if err := rows.Scan(&id, &sku, &reason, &qty, &status); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{"id": id, "sku": sku, "reason": reason, "qty": qty, "status": status})
	}
	return list, rows.Err()
}

func (s *Server) loadShipments(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, origin, invoice, eta, status, items FROM shipments ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, origin, invoice, eta, status string
		var items int
		if err := rows.Scan(&id, &origin, &invoice, &eta, &status, &items); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{"id": id, "origin": origin, "invoice": invoice, "eta": eta, "status": status, "items": items})
	}
	return list, rows.Err()
}

func (s *Server) loadPromotions(ctx context.Context) ([]map[string]any, error) {
	rows, err := s.DB.Query(ctx, `SELECT id, name, status, period, scope, note, category FROM promotions ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, name, status, period, scope, note, category string
		if err := rows.Scan(&id, &name, &status, &period, &scope, &note, &category); err != nil {
			return nil, err
		}
		list = append(list, map[string]any{
			"id": id, "name": name, "status": status, "period": period,
			"scope": scope, "note": note, "category": category,
		})
	}
	return list, rows.Err()
}

func (s *Server) loadNotes(ctx context.Context) (map[string][]string, error) {
	rows, err := s.DB.Query(ctx, `SELECT store_id, body FROM branch_notes ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	notes := map[string][]string{}
	for rows.Next() {
		var storeID, body string
		if err := rows.Scan(&storeID, &body); err != nil {
			return nil, err
		}
		notes[storeID] = append(notes[storeID], body)
	}
	return notes, rows.Err()
}

func (s *Server) loadOperations(ctx context.Context, branchID string) (map[string]any, error) {
	if branchID == "" {
		branchID = "MIN-BD-DHK-014"
	}
	rows, err := s.DB.Query(ctx, `
		SELECT id, phase, label, done, warn FROM operation_tasks
		WHERE store_id=$1 ORDER BY sort_order`, branchID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	ops := map[string]any{"opening": []map[string]any{}, "during": []map[string]any{}, "closing": []map[string]any{}}
	for rows.Next() {
		var id, phase, label string
		var done, warn bool
		if err := rows.Scan(&id, &phase, &label, &done, &warn); err != nil {
			return nil, err
		}
		item := map[string]any{"id": id, "label": label, "done": done}
		if warn {
			item["warn"] = true
		}
		if phase == "opening" || phase == "during" || phase == "closing" {
			ops[phase] = append(ops[phase].([]map[string]any), item)
		}
	}
	return ops, rows.Err()
}

func (s *Server) loadSeries(ctx context.Context, name string) ([]int, error) {
	rows, err := s.DB.Query(ctx, `SELECT value FROM series_points WHERE name=$1 ORDER BY idx`, name)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []int{}
	for rows.Next() {
		var value int
		if err := rows.Scan(&value); err != nil {
			return nil, err
		}
		list = append(list, value)
	}
	return list, rows.Err()
}

func (s *Server) loadOrg(ctx context.Context, stores []map[string]any) (map[string]any, error) {
	var hqID, hqName, country, city, ownerID, ownerName string
	err := s.DB.QueryRow(ctx, `
		SELECT h.id, h.name, h.country, h.city, COALESCE(h.owner_user_id,''), COALESCE(u.name,'')
		FROM headquarters h
		LEFT JOIN users u ON u.id = h.owner_user_id
		ORDER BY h.id LIMIT 1`).Scan(&hqID, &hqName, &country, &city, &ownerID, &ownerName)
	if err != nil {
		return map[string]any{
			"hq":       map[string]any{"id": "", "name": "Bangladesh HQ", "country": "Bangladesh", "city": "Dhaka", "ownerUserId": "", "ownerName": ""},
			"branches": stores,
		}, nil
	}
	branches := []map[string]any{}
	for _, store := range stores {
		branches = append(branches, map[string]any{
			"id": store["id"], "name": store["name"], "city": store["city"], "status": store["status"],
			"manager": store["manager"], "managerUserId": store["managerUserId"], "managerEmail": store["managerEmail"],
			"staffTotal": store["staffTotal"], "staffPresent": store["staffPresent"],
			"salesToday": store["salesToday"], "salesTarget": store["salesTarget"],
		})
	}
	return map[string]any{
		"hq": map[string]any{
			"id": hqID, "name": hqName, "country": country, "city": city,
			"ownerUserId": ownerID, "ownerName": ownerName,
		},
		"branches": branches,
	}, nil
}

func (s *Server) loadBoards(ctx context.Context, stores []map[string]any) (map[string]any, error) {
	boards := map[string]map[string]any{}
	for _, store := range stores {
		id := store["id"].(string)
		boards[id] = map[string]any{
			"storeId": id, "storeName": store["name"], "manager": store["manager"],
			"salesTarget": store["salesTarget"], "salesToday": store["salesToday"],
			"transactions": store["transactions"], "avgBasket": store["avgBasket"],
			"stockAvailability": store["stockAvailability"],
			"lowStockSkus": 0, "outOfStockSkus": 0,
			"staffPresent": store["staffPresent"], "staffTotal": store["staffTotal"],
			"pendingTasks": 0, "lastSaleAt": time.Now().Format("3:04 PM"),
			"alerts": []map[string]any{}, "topSellers": []map[string]any{}, "hourly": []int{},
		}
	}
	addAlert := func(storeID string, alert map[string]any) {
		board, ok := boards[storeID]
		if !ok {
			return
		}
		board["alerts"] = append(board["alerts"].([]map[string]any), alert)
	}

	rows, err := s.DB.Query(ctx, `
		SELECT st.location_id, p.name, st.on_hand, st.target, st.status
		FROM stock st JOIN products p ON p.id = st.product_id
		WHERE st.location_kind='store' AND st.status IN ('low','critical','out')`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var storeID, name, status string
		var onHand, target int
		if err := rows.Scan(&storeID, &name, &onHand, &target, &status); err != nil {
			rows.Close()
			return nil, err
		}
		if board, ok := boards[storeID]; ok {
			if status == "out" {
				board["outOfStockSkus"] = board["outOfStockSkus"].(int) + 1
			} else {
				board["lowStockSkus"] = board["lowStockSkus"].(int) + 1
			}
		}
		severity := "warning"
		if status == "critical" || status == "out" {
			severity = "critical"
		}
		addAlert(storeID, map[string]any{
			"id": name, "severity": severity, "title": name + " · " + status,
			"detail": itoa(onHand) + " on hand · target " + itoa(target),
		})
	}
	rows.Close()

	rows, err = s.DB.Query(ctx, `SELECT to_id, id, qty, sku FROM transfers WHERE status='In Transit'`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var storeID, id, sku string
		var qty int
		if err := rows.Scan(&storeID, &id, &qty, &sku); err != nil {
			rows.Close()
			return nil, err
		}
		addAlert(storeID, map[string]any{
			"id": id, "severity": "info", "title": "Inbound transfer " + id,
			"detail": sku + " · " + itoa(qty) + " units",
		})
	}
	rows.Close()

	rows, err = s.DB.Query(ctx, `
		SELECT sa.store_id, p.name, COALESCE(SUM(sl.qty),0), COALESCE(SUM(sl.qty * sl.price),0)
		FROM sale_lines sl
		JOIN sales sa ON sa.id = sl.sale_id
		JOIN products p ON p.id = sl.product_id
		WHERE sa.created_at::date = CURRENT_DATE
		GROUP BY sa.store_id, p.name
		ORDER BY SUM(sl.qty) DESC`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var storeID, name string
		var units int
		var revenue int64
		if err := rows.Scan(&storeID, &name, &units, &revenue); err != nil {
			rows.Close()
			return nil, err
		}
		if board, ok := boards[storeID]; ok {
			sellers := board["topSellers"].([]map[string]any)
			if len(sellers) < 4 {
				board["topSellers"] = append(sellers, map[string]any{"name": name, "units": units, "revenue": revenue})
			}
		}
	}
	rows.Close()

	rows, err = s.DB.Query(ctx, `SELECT store_id, amount FROM hourly_sales ORDER BY store_id, hour`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var storeID string
		var amount int
		if err := rows.Scan(&storeID, &amount); err != nil {
			rows.Close()
			return nil, err
		}
		if board, ok := boards[storeID]; ok {
			board["hourly"] = append(board["hourly"].([]int), amount)
		}
	}
	rows.Close()

	rows, err = s.DB.Query(ctx, `SELECT store_id, COUNT(*) FROM operation_tasks WHERE done=false GROUP BY store_id`)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var storeID string
		var pending int
		if err := rows.Scan(&storeID, &pending); err != nil {
			rows.Close()
			return nil, err
		}
		if board, ok := boards[storeID]; ok {
			board["pendingTasks"] = pending
		}
	}
	rows.Close()

	out := map[string]any{}
	for id, board := range boards {
		out[id] = board
	}
	return out, nil
}

func (s *Server) notifications(inventory, approvals, shipments, transfers []map[string]any) map[string]any {
	critical := []map[string]any{}
	attention := []map[string]any{}
	info := []map[string]any{}
	for _, row := range inventory {
		if row["status"] == "out" || row["status"] == "critical" {
			critical = append(critical, map[string]any{
				"id":    row["sku"].(string) + row["store"].(string),
				"title": row["status"].(string) + " — " + row["name"].(string),
				"meta":  row["store"].(string),
			})
		}
	}
	if len(approvals) > 0 {
		attention = append(attention, map[string]any{
			"id": "approvals", "title": itoa(len(approvals)) + " approvals waiting", "meta": "Approvals",
		})
	}
	for _, shipment := range shipments {
		if shipment["status"] == "In Transit" || shipment["status"] == "Receiving" {
			attention = append(attention, map[string]any{
				"id": shipment["id"], "title": "Shipment " + shipment["id"].(string), "meta": shipment["status"].(string) + " · " + shipment["origin"].(string),
			})
		}
	}
	for _, transfer := range transfers {
		if transfer["status"] == "Completed" {
			info = append(info, map[string]any{
				"id": transfer["id"], "title": "Transfer " + transfer["id"].(string) + " received", "meta": transfer["to"].(string),
			})
		}
	}
	return map[string]any{"critical": critical, "attention": attention, "info": info}
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	buf := []byte{}
	for n > 0 {
		buf = append([]byte{byte('0' + n%10)}, buf...)
		n /= 10
	}
	if neg {
		buf = append([]byte{'-'}, buf...)
	}
	return string(buf)
}
