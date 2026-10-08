package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type storeSeed struct {
	id, name, city, country, status, manager, managerUser string
	sales, tx, basket, target                             int
	availability                                          float64
}

func Seed(ctx context.Context, pool *pgxpool.Pool) error {
	var n int
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	const hqID = "HQ-BD"
	if _, err := tx.Exec(ctx, `
		INSERT INTO headquarters (id, name, country, city, owner_user_id)
		VALUES ($1,'Bangladesh HQ','Bangladesh','Dhaka','u-owner')`, hqID); err != nil {
		return err
	}

	stores := []storeSeed{
		{"MIN-BD-DHK-014", "Dhanmondi Store", "Dhaka", "Bangladesh", "operational", "Nusrat Jahan", "u-store", 184500, 426, 433, 220000, 96.2},
		{"MIN-BD-DHK-008", "Gulshan Store", "Dhaka", "Bangladesh", "operational", "Rahim Khan", "u-store-gulshan", 256800, 512, 502, 280000, 91.4},
		{"MIN-BD-DHK-021", "Uttara Store", "Dhaka", "Bangladesh", "operational", "Farhana Akter", "u-store-uttara", 142300, 318, 447, 160000, 88.7},
		{"MIN-BD-CTG-003", "Chittagong Agrabad", "Chittagong", "Bangladesh", "maintenance", "Imran Hossain", "u-store-ctg", 98400, 210, 469, 120000, 94.1},
	}
	for _, s := range stores {
		if _, err := tx.Exec(ctx, `
			INSERT INTO stores (id, name, city, country, status, manager_name, manager_user_id, hq_id, sales_today, transactions, avg_basket, stock_availability, sales_target)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
			s.id, s.name, s.city, s.country, s.status, s.manager, s.managerUser, hqID, s.sales, s.tx, s.basket, s.availability, s.target,
		); err != nil {
			return err
		}
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO warehouses (id, name, city, capacity, inbound, outbound, hq_id) VALUES
		('WH-BD-DHK-01','Dhaka DC','Dhaka',92,14,28,$1),
		('WH-BD-CTG-01','Chittagong DC','Chittagong',71,6,11,$1)`, hqID); err != nil {
		return err
	}

	type userSeed struct {
		id, email, password, name, initials, role, title, workspace, branch, phone string
	}
	// HQ → every branch manager is a real login tied to that store.
	users := []userSeed{
		{"u-owner", "owner@miniso.bd", "owner123", "Amina Rahman", "AR", "owner", "Country Owner", "Bangladesh HQ", "", "01710-000001"},
		{"u-manager", "manager@miniso.bd", "manager123", "Karim Jahan", "KJ", "inventory_manager", "Inventory Manager", "Supply Chain HQ", "", "01710-000002"},
		{"u-warehouse", "warehouse@miniso.bd", "warehouse123", "Rashedul Karim", "RK", "warehouse_staff", "Warehouse Staff", "Dhaka DC", "", "01710-000003"},
		{"u-store", "store@miniso.bd", "store123", "Nusrat Jahan", "NJ", "store_manager", "Branch Manager", "Dhanmondi Store", "MIN-BD-DHK-014", "01710-100014"},
		{"u-store-gulshan", "gulshan@miniso.bd", "store123", "Rahim Khan", "RH", "store_manager", "Branch Manager", "Gulshan Store", "MIN-BD-DHK-008", "01710-100008"},
		{"u-store-uttara", "uttara@miniso.bd", "store123", "Farhana Akter", "FA", "store_manager", "Branch Manager", "Uttara Store", "MIN-BD-DHK-021", "01710-100021"},
		{"u-store-ctg", "ctg@miniso.bd", "store123", "Imran Hossain", "IH", "store_manager", "Branch Manager", "Chittagong Agrabad", "MIN-BD-CTG-003", "01810-100003"},
		{"u-social", "social@miniso.bd", "social123", "Tania Akter", "TA", "social_media", "Social Media Lead", "Dhanmondi Store", "MIN-BD-DHK-014", "01710-200014"},
	}
	for _, u := range users {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.password), bcrypt.MinCost)
		if err != nil {
			return err
		}
		var branch any
		if u.branch != "" {
			branch = u.branch
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO users (id, email, password_hash, name, initials, role, title, workspace, branch_id, phone)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
			u.id, u.email, string(hash), u.name, u.initials, u.role, u.title, u.workspace, branch, u.phone,
		); err != nil {
			return err
		}
	}

	if err := seedStaff(ctx, tx); err != nil {
		return err
	}
	if err := seedCatalog(ctx, tx); err != nil {
		return err
	}
	if err := seedOps(ctx, tx); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

type staffSeed struct {
	id, email, password, name, branch, position, code, phone, address, joined string
	salary                                                                     int
	bank, emergency, emergencyPhone, shiftStart, shiftEnd                      string
	offDay                                                                     int
}

func seedStaff(ctx context.Context, tx pgx.Tx) error {
	// Each person clocks and requests leave under their branch manager.
	people := []staffSeed{
		// Dhanmondi — manager Nusrat (u-store)
		{"st-rafi", "staff@miniso.bd", "staff123", "Rafi Islam", "MIN-BD-DHK-014", "Cashier", "EMP-DHK-014", "01711-220184", "House 12, Road 8, Dhanmondi, Dhaka", "2024-03-18", 28000, "DBBL ···· 4412", "Laila Islam", "01819-440221", "09:00", "17:00", 5},
		{"st-sadia", "sadia.noor@miniso.bd", "staff123", "Sadia Noor", "MIN-BD-DHK-014", "Floor Associate", "EMP-DHK-018", "01612-883041", "Mohammadpur, Dhaka", "2023-11-02", 24000, "BRAC ···· 9021", "Karim Noor", "01911-220198", "10:00", "19:00", 5},
		{"st-imtiaz", "imtiaz.kabir@miniso.bd", "staff123", "Imtiaz Kabir", "MIN-BD-DHK-014", "Cashier", "EMP-DHK-021", "01552-110984", "Kalabagan, Dhaka", "2025-01-09", 26000, "City ···· 1180", "Roksana Kabir", "01713-998120", "12:00", "21:00", 1},
		{"st-lamia", "lamia.hasan@miniso.bd", "staff123", "Lamia Hasan", "MIN-BD-DHK-014", "Visual Merchandiser", "EMP-DHK-009", "01312-445670", "Lalmatia, Dhaka", "2022-08-14", 32000, "EBL ···· 7733", "Hasan Mahmud", "01618-221009", "09:00", "18:00", 5},
		// Gulshan — manager Rahim (u-store-gulshan)
		{"st-anika", "anika.chowdhury@miniso.bd", "staff123", "Anika Chowdhury", "MIN-BD-DHK-008", "Floor Associate", "EMP-GUL-004", "01718-330221", "Banani, Dhaka", "2024-06-01", 25000, "DBBL ···· 2201", "Farzana Chowdhury", "01819-100334", "09:00", "18:00", 5},
		{"st-mahmud", "mahmud.hasan@miniso.bd", "staff123", "Mahmud Hasan", "MIN-BD-DHK-008", "Cashier", "EMP-GUL-011", "01914-882210", "Gulshan 1, Dhaka", "2023-02-20", 29000, "BRAC ···· 4419", "Nargis Hasan", "01512-009981", "11:00", "20:00", 5},
		{"st-priya", "priya.das@miniso.bd", "staff123", "Priya Das", "MIN-BD-DHK-008", "Stock Associate", "EMP-GUL-016", "01620-774512", "Badda, Dhaka", "2025-04-11", 23000, "City ···· 3094", "Ratan Das", "01711-665430", "08:00", "17:00", 5},
		{"st-joya", "joya.islam@miniso.bd", "staff123", "Joya Islam", "MIN-BD-DHK-008", "Cashier", "EMP-GUL-019", "01722-551190", "Baridhara, Dhaka", "2024-11-03", 27000, "EBL ···· 4410", "Islam Uddin", "01811-220455", "09:00", "17:00", 5},
		// Uttara — manager Farhana (u-store-uttara)
		{"st-nabil", "nabil.rahman@miniso.bd", "staff123", "Nabil Rahman", "MIN-BD-DHK-021", "Cashier", "EMP-UTT-003", "01820-119043", "Uttara Sector 7, Dhaka", "2024-09-16", 25500, "DBBL ···· 8812", "Rahman Ali", "01913-220187", "09:00", "18:00", 5},
		{"st-mitu", "mitu.akter@miniso.bd", "staff123", "Mitu Akter", "MIN-BD-DHK-021", "Floor Associate", "EMP-UTT-008", "01516-443290", "Uttara Sector 4, Dhaka", "2023-12-05", 22000, "BRAC ···· 1028", "Akter Hossain", "01712-883001", "10:00", "19:00", 5},
		{"st-omar", "omar.faruq@miniso.bd", "staff123", "Omar Faruq", "MIN-BD-DHK-021", "Cashier", "EMP-UTT-012", "01611-778822", "Uttara Sector 10, Dhaka", "2025-02-14", 26000, "City ···· 2290", "Faruq Ahmed", "01918-441100", "12:00", "21:00", 5},
		// Agrabad — manager Imran (u-store-ctg)
		{"st-shakil", "shakil.ahmed@miniso.bd", "staff123", "Shakil Ahmed", "MIN-BD-CTG-003", "Floor Associate", "EMP-CTG-002", "01818-229410", "Agrabad, Chittagong", "2022-05-22", 24000, "City ···· 5510", "Ahmed Karim", "01611-220945", "09:00", "18:00", 5},
		{"st-rina", "rina.begum@miniso.bd", "staff123", "Rina Begum", "MIN-BD-CTG-003", "Cashier", "EMP-CTG-006", "01716-990214", "Halishahar, Chittagong", "2024-01-28", 25000, "DBBL ···· 6641", "Begum Ara", "01911-334870", "12:00", "21:00", 5},
		{"st-kabir", "kabir.hossain@miniso.bd", "staff123", "Kabir Hossain", "MIN-BD-CTG-003", "Stock Associate", "EMP-CTG-009", "01817-334455", "Nasirabad, Chittagong", "2023-07-19", 23500, "BRAC ···· 7781", "Hossain Ali", "01719-220033", "08:00", "17:00", 5},
	}
	now := time.Now()
	for _, p := range people {
		hash, err := bcrypt.GenerateFromPassword([]byte(p.password), bcrypt.MinCost)
		if err != nil {
			return err
		}
		initials := initials(p.name)
		var workspace, manager string
		var managerUser any
		if err := tx.QueryRow(ctx, `SELECT name, manager_name, manager_user_id FROM stores WHERE id=$1`, p.branch).Scan(&workspace, &manager, &managerUser); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO users (id, email, password_hash, name, initials, role, title, workspace, branch_id, phone)
			VALUES ($1,$2,$3,$4,$5,'staff',$6,$7,$8,$9)`,
			p.id, p.email, string(hash), p.name, initials, p.position, workspace, p.branch, p.phone,
		); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO staff (id, branch_id, position, employee_code, phone, address, joined, base_salary, bank_account, emergency_name, emergency_phone, shift_start, shift_end, off_day, manager_name, manager_user_id)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
			p.id, p.branch, p.position, p.code, p.phone, p.address, p.joined, p.salary, p.bank, p.emergency, p.emergencyPhone, p.shiftStart, p.shiftEnd, p.offDay, manager, managerUser,
		); err != nil {
			return err
		}
		if err := seedPunches(ctx, tx, p, now); err != nil {
			return err
		}
	}

	today := now.Format("2006-01-02")
	tomorrow := now.Add(24 * time.Hour).Format("2006-01-02")
	_, err := tx.Exec(ctx, `
		INSERT INTO leaves (id, staff_id, kind, from_date, to_date, reason, status) VALUES
		('lv-lamia','st-lamia','casual',$1,$1,'Family appointment in the morning','pending'),
		('lv-anika','st-anika','sick',$2,$2,'Fever — resting tomorrow','pending'),
		('lv-nabil','st-nabil','casual',$2,$2,'Transport to village for paperwork','pending')`, today, tomorrow)
	return err
}

func seedPunches(ctx context.Context, tx pgx.Tx, p staffSeed, now time.Time) error {
	year, month, today := now.Date()
	for day := 1; day <= today; day++ {
		date := time.Date(year, month, day, 0, 0, 0, 0, now.Location())
		if int(date.Weekday()) == p.offDay {
			continue
		}
		if p.id == "st-lamia" && day == today {
			continue
		}
		start := parseShift(date, p.shiftStart)
		end := parseShift(date, p.shiftEnd)
		if start.After(now) {
			continue
		}
		if _, err := tx.Exec(ctx, `INSERT INTO punches (id, staff_id, type, at) VALUES ($1,$2,'in',$3)`,
			fmt.Sprintf("%s-%d-in", p.id, day), p.id, start); err != nil {
			return err
		}
		if day < today || !now.Before(end) {
			if _, err := tx.Exec(ctx, `INSERT INTO punches (id, staff_id, type, at) VALUES ($1,$2,'out',$3)`,
				fmt.Sprintf("%s-%d-out", p.id, day), p.id, end); err != nil {
				return err
			}
		} else if p.id == "st-imtiaz" {
			breakAt := now.Add(-12 * time.Minute)
			if breakAt.After(start) {
				if _, err := tx.Exec(ctx, `INSERT INTO punches (id, staff_id, type, at) VALUES ($1,$2,'break_start',$3)`,
					fmt.Sprintf("%s-%d-break", p.id, day), p.id, breakAt); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func seedCatalog(ctx context.Context, tx pgx.Tx) error {
	type product struct {
		id, sku, name, category, brand, image string
		price, cost, sold, coverage, sell     int
		revenue                               int64
		margin                                float64
	}
	products := []product{
		{"MIN-PL-2048", "SKU-2048", "Sanrio Plush Bear", "Toys & IP", "Sanrio", "🧸", 1250, 620, 3840, 18, 72, 4800000, 50.4},
		{"MIN-BG-1102", "SKU-1102", "Canvas Tote Bag", "Lifestyle", "MINISO", "👜", 850, 310, 1920, 22, 68, 1632000, 63.5},
		{"MIN-ST-3301", "SKU-3301", "Gel Pen Set (12pc)", "Stationery", "MINISO", "✏️", 390, 145, 9200, 2, 91, 3588000, 62.8},
		{"MIN-HM-4410", "SKU-4410", "Aroma Diffuser Mini", "Home", "MINISO", "🫧", 1890, 840, 860, 6, 64, 1625400, 55.6},
		{"MIN-BT-5520", "SKU-5520", "Skyline Water Bottle 500ml", "Lifestyle", "MINISO", "🧴", 690, 250, 4100, 0, 88, 2829000, 63.8},
		{"MIN-BT-6611", "SKU-6611", "Wireless Earbuds Lite", "Electronics", "MINISO", "🎧", 2490, 1180, 980, 24, 58, 2440200, 52.6},
	}
	for _, p := range products {
		if _, err := tx.Exec(ctx, `
			INSERT INTO products (id, sku, name, category, brand, price, cost, status, image, units_sold_30d, revenue_30d, margin, sell_through, stock_coverage)
			VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8,$9,$10,$11,$12,$13)`,
			p.id, p.sku, p.name, p.category, p.brand, p.price, p.cost, p.image, p.sold, p.revenue, p.margin, p.sell, p.coverage,
		); err != nil {
			return err
		}
	}

	type stockRow struct {
		id, product, kind, loc, name, status string
		onHand, reserved, transit, target    int
	}
	// Every branch holds the same catalog so POS / lookup / transfers share one product graph.
	rows := []stockRow{
		{"stk-dhk-plush", "MIN-PL-2048", "store", "MIN-BD-DHK-014", "Dhanmondi", "low", 8, 2, 24, 30},
		{"stk-dhk-tote", "MIN-BG-1102", "store", "MIN-BD-DHK-014", "Dhanmondi", "healthy", 28, 0, 0, 30},
		{"stk-dhk-pen", "MIN-ST-3301", "store", "MIN-BD-DHK-014", "Dhanmondi", "critical", 3, 0, 0, 40},
		{"stk-dhk-diff", "MIN-HM-4410", "store", "MIN-BD-DHK-014", "Dhanmondi", "healthy", 14, 0, 0, 15},
		{"stk-dhk-bottle", "MIN-BT-5520", "store", "MIN-BD-DHK-014", "Dhanmondi", "out", 0, 0, 40, 25},
		{"stk-dhk-buds", "MIN-BT-6611", "store", "MIN-BD-DHK-014", "Dhanmondi", "healthy", 18, 1, 0, 15},
		{"stk-gul-plush", "MIN-PL-2048", "store", "MIN-BD-DHK-008", "Gulshan", "healthy", 42, 0, 0, 40},
		{"stk-gul-tote", "MIN-BG-1102", "store", "MIN-BD-DHK-008", "Gulshan", "healthy", 36, 2, 0, 30},
		{"stk-gul-pen", "MIN-ST-3301", "store", "MIN-BD-DHK-008", "Gulshan", "healthy", 55, 0, 0, 40},
		{"stk-gul-diff", "MIN-HM-4410", "store", "MIN-BD-DHK-008", "Gulshan", "low", 9, 0, 0, 15},
		{"stk-gul-bottle", "MIN-BT-5520", "store", "MIN-BD-DHK-008", "Gulshan", "out", 0, 0, 120, 35},
		{"stk-gul-buds", "MIN-BT-6611", "store", "MIN-BD-DHK-008", "Gulshan", "healthy", 22, 0, 0, 15},
		{"stk-utt-plush", "MIN-PL-2048", "store", "MIN-BD-DHK-021", "Uttara", "healthy", 26, 0, 0, 30},
		{"stk-utt-tote", "MIN-BG-1102", "store", "MIN-BD-DHK-021", "Uttara", "healthy", 64, 4, 0, 30},
		{"stk-utt-pen", "MIN-ST-3301", "store", "MIN-BD-DHK-021", "Uttara", "low", 11, 0, 0, 40},
		{"stk-utt-diff", "MIN-HM-4410", "store", "MIN-BD-DHK-021", "Uttara", "healthy", 16, 0, 0, 15},
		{"stk-utt-bottle", "MIN-BT-5520", "store", "MIN-BD-DHK-021", "Uttara", "healthy", 31, 0, 0, 25},
		{"stk-utt-buds", "MIN-BT-6611", "store", "MIN-BD-DHK-021", "Uttara", "healthy", 12, 0, 0, 15},
		{"stk-ctg-plush", "MIN-PL-2048", "store", "MIN-BD-CTG-003", "Agrabad", "healthy", 20, 0, 0, 25},
		{"stk-ctg-tote", "MIN-BG-1102", "store", "MIN-BD-CTG-003", "Agrabad", "healthy", 22, 0, 0, 25},
		{"stk-ctg-pen", "MIN-ST-3301", "store", "MIN-BD-CTG-003", "Agrabad", "healthy", 40, 0, 0, 35},
		{"stk-ctg-diff", "MIN-HM-4410", "store", "MIN-BD-CTG-003", "Agrabad", "low", 12, 0, 0, 20},
		{"stk-ctg-bottle", "MIN-BT-5520", "store", "MIN-BD-CTG-003", "Agrabad", "healthy", 18, 0, 0, 20},
		{"stk-ctg-buds", "MIN-BT-6611", "store", "MIN-BD-CTG-003", "Agrabad", "healthy", 10, 0, 0, 12},
		{"stk-wh-plush", "MIN-PL-2048", "warehouse", "WH-BD-DHK-01", "Dhaka DC", "healthy", 4746, 24, 0, 0},
		{"stk-wh-tote", "MIN-BG-1102", "warehouse", "WH-BD-DHK-01", "Dhaka DC", "healthy", 2040, 0, 0, 0},
		{"stk-wh-pen", "MIN-ST-3301", "warehouse", "WH-BD-DHK-01", "Dhaka DC", "healthy", 5, 0, 500, 0},
		{"stk-wh-diff", "MIN-HM-4410", "warehouse", "WH-BD-DHK-01", "Dhaka DC", "healthy", 12, 0, 80, 0},
		{"stk-wh-bottle", "MIN-BT-5520", "warehouse", "WH-BD-DHK-01", "Dhaka DC", "transit", 0, 0, 1080, 0},
		{"stk-wh-buds", "MIN-BT-6611", "warehouse", "WH-BD-DHK-01", "Dhaka DC", "healthy", 1542, 0, 300, 0},
		{"stk-whc-plush", "MIN-PL-2048", "warehouse", "WH-BD-CTG-01", "Chittagong DC", "healthy", 820, 0, 0, 0},
		{"stk-whc-tote", "MIN-BG-1102", "warehouse", "WH-BD-CTG-01", "Chittagong DC", "healthy", 410, 0, 0, 0},
	}
	for _, r := range rows {
		if _, err := tx.Exec(ctx, `
			INSERT INTO stock (id, product_id, location_kind, location_id, location_name, on_hand, reserved, in_transit, target, status)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
			r.id, r.product, r.kind, r.loc, r.name, r.onHand, r.reserved, r.transit, r.target, r.status,
		); err != nil {
			return err
		}
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO purchase_orders (id, supplier, destination, warehouse_id, expected, status, items, value, stage) VALUES
		('PO-2026-00482','ABC Manufacturing','Dhaka DC','WH-BD-DHK-01','18 Oct 2026','in_transit',24,1840000,5),
		('PO-2026-00491','Guangzhou Toys Co.','Dhaka DC','WH-BD-DHK-01','22 Oct 2026','pending_approval',18,920000,1),
		('PO-2026-00455','HomeCraft Ltd','Chittagong DC','WH-BD-CTG-01','12 Oct 2026','received',32,2100000,6),
		('PO-2026-00501','Stationery Plus','Dhaka DC','WH-BD-DHK-01','25 Oct 2026','supplier_confirmed',40,640000,3)`); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO shipments (id, origin, invoice, eta, status, items, warehouse_id, product_id, qty, po_id) VALUES
		('SHP-2026-118','Guangzhou, China','INV-CN-88421','18 Oct 2026','In Transit',24,'WH-BD-DHK-01','MIN-PL-2048',240,'PO-2026-00482'),
		('SHP-2026-109','Osaka, Japan','INV-JP-2201','12 Oct 2026','Receiving',16,'WH-BD-DHK-01','MIN-BT-6611',80,NULL),
		('SHP-2026-094','Shenzhen, China','INV-CN-87110','5 Oct 2026','Received',40,'WH-BD-DHK-01','MIN-BG-1102',400,'PO-2026-00455')`); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO transfers (id, from_name, to_name, from_kind, from_id, to_kind, to_id, product_id, sku, qty, status) VALUES
		('TR-DHK-229','Dhaka DC','Dhanmondi Store','warehouse','WH-BD-DHK-01','store','MIN-BD-DHK-014','MIN-PL-2048','SKU-2048',24,'In Transit'),
		('TR-UTT-118','Dhaka DC','Uttara Store','warehouse','WH-BD-DHK-01','store','MIN-BD-DHK-021','MIN-BG-1102','SKU-1102',40,'Completed')`); err != nil {
		return err
	}

	_, err := tx.Exec(ctx, `
		INSERT INTO adjustments (id, sku, reason, qty, status, store_name, store_id, product_id, location_kind) VALUES
		('ADJ-441','SKU-2048','Damage',-48,'Pending approval','Dhaka DC','WH-BD-DHK-01','MIN-PL-2048','warehouse'),
		('ADJ-438','SKU-3301','Recount',4,'Posted','Dhanmondi Store','MIN-BD-DHK-014','MIN-ST-3301','store')`)
	return err
}

func seedOps(ctx context.Context, tx pgx.Tx) error {
	if _, err := tx.Exec(ctx, `
		INSERT INTO customers (id, name, phone, tier, lifetime_spend, orders, avg_basket, points, home_store_id) VALUES
		('CUS-100284','Ayesha Rahman','+880 1712-445566','Gold',42800,36,1189,2140,'MIN-BD-DHK-014'),
		('CUS-100512','Tanvir Ahmed','+880 1811-998877','Silver',18650,14,1332,840,'MIN-BD-DHK-008'),
		('CUS-100901','Maliha Chowdhury','+880 1913-334455','Platinum',98600,72,1369,4920,'MIN-BD-DHK-021')`); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO conversations (id, channel, customer, preview, time_label, unread, ai_confidence, store_id) VALUES
		('1','Instagram','@nabila.k','Do you have Sanrio plush in Dhanmondi?','2m',true,96,'MIN-BD-DHK-014'),
		('2','WhatsApp','+880 17•••8899','What''s the price of the tote bag?','14m',true,99,'MIN-BD-DHK-014'),
		('3','Facebook','Rafiul Islam','Can I return earbuds bought yesterday?','1h',false,88,'MIN-BD-DHK-008'),
		('4','Instagram','@samiya.designs','When will water bottles restock?','3h',false,91,'MIN-BD-DHK-008')`); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO social_messages (id, conversation_id, sender, text, time_label) VALUES
		('m1','1','customer','Hi! Do you have the Sanrio Plush Bear in Dhanmondi store?','11:42'),
		('m2','1','ai','Yes — Dhanmondi currently has 8 units of Sanrio Plush Bear (SKU-2048) available at ৳1,250. Stock is low; I recommend visiting today.','11:42'),
		('m3','1','customer','Is there a loyalty offer on it?','11:44'),
		('m4','1','ai','Gold members get 1.5× points this week on Toys & IP. Nearest alternate with higher stock: Gulshan (42 units).','11:44'),
		('m5','1','system','AI confidence 96% · Sources: live store inventory, active promo catalog','11:44')`); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO warehouse_tasks (id, warehouse_id, type, ref, status, priority, assignee) VALUES
		('WH-T-101','WH-BD-DHK-01','Receiving','SHP-2026-109','in_progress','high','Team A'),
		('WH-T-102','WH-BD-DHK-01','Put Away','GRN-4410','pending','medium','Team B'),
		('WH-T-103','WH-BD-DHK-01','Picking','TR-DHK-229','waiting','high','Team C'),
		('WH-T-104','WH-BD-DHK-01','Dispatch','TR-UTT-118','completed','low','Team A'),
		('WH-T-105','WH-BD-DHK-01','Stock Count','CNT-ZONE-B','exception','high','QC Lead')`); err != nil {
		return err
	}

	tasks := []struct {
		phase, label string
		done, warn   bool
	}{
		{"opening", "Attendance checked", true, false},
		{"opening", "POS status verified", true, false},
		{"opening", "Cash float verified", true, false},
		{"opening", "Store opening checklist", true, false},
		{"opening", "Equipment status", true, false},
		{"during", "Replenishment — aisle 3", true, false},
		{"during", "Display task — Sanrio endcap", true, false},
		{"during", "3 low-stock SKUs flagged", false, true},
		{"during", "Customer issue #4412", false, false},
		{"during", "Maintenance request — AC zone B", false, true},
		{"closing", "Cash reconciliation", false, false},
		{"closing", "POS closing", false, false},
		{"closing", "Refund review", false, false},
		{"closing", "Stock exceptions", false, false},
		{"closing", "Daily summary", false, false},
	}
	stores := []string{"MIN-BD-DHK-014", "MIN-BD-DHK-008", "MIN-BD-DHK-021", "MIN-BD-CTG-003"}
	for _, storeID := range stores {
		for i, task := range tasks {
			id := fmt.Sprintf("%s-%s-%d", storeID, task.phase, i)
			if _, err := tx.Exec(ctx, `
				INSERT INTO operation_tasks (id, store_id, phase, label, done, warn, sort_order)
				VALUES ($1,$2,$3,$4,$5,$6,$7)`,
				id, storeID, task.phase, task.label, task.done, task.warn, i,
			); err != nil {
				return err
			}
		}
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO promotions (id, name, status, period, scope, category, note) VALUES
		('PR-1','Sanrio Weekend Points Boost','Active','4–12 Oct 2026','Toys & IP · Bangladesh','Toys & IP','Gold members get 1.5× points this week on Toys & IP.'),
		('PR-2','Stationery Clearance −15%','Pending approval','10–17 Oct 2026','Gel pens & notebooks','Stationery','Waiting on a price approval before POS can apply it.'),
		('PR-3','Member Double Points Friday','Scheduled','Every Friday','All stores · Gold+','','')`); err != nil {
		return err
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO branch_notes (id, store_id, body) VALUES
		('n-dhk-1','MIN-BD-DHK-014','Promo wall resets before 11:00. Ask Nusrat if a bay is unclear.'),
		('n-dhk-2','MIN-BD-DHK-014','Water bottles land this afternoon. Don’t promise them until the transfer is received.'),
		('n-gul-1','MIN-BD-DHK-008','Gulshan weekend roster is full. Swap requests go through Rahim before Thursday.'),
		('n-utt-1','MIN-BD-DHK-021','Uttara stock count is Friday after close. Don’t start early.'),
		('n-ctg-1','MIN-BD-CTG-003','Agrabad is on a short maintenance window. Keep the side aisle clear.')`); err != nil {
		return err
	}

	sales := []int{42, 48, 45, 52, 58, 61, 55, 68, 72, 70, 78, 84}
	inventory := []int{78, 80, 79, 82, 85, 84, 88, 90, 89, 92, 93, 94}
	for i, v := range sales {
		if _, err := tx.Exec(ctx, `INSERT INTO series_points (name, idx, value) VALUES ('sales',$1,$2)`, i, v); err != nil {
			return err
		}
	}
	for i, v := range inventory {
		if _, err := tx.Exec(ctx, `INSERT INTO series_points (name, idx, value) VALUES ('inventory',$1,$2)`, i, v); err != nil {
			return err
		}
	}
	hourly := []int{8200, 12400, 18600, 22100, 19800, 24500, 27800, 21400, 16200, 13500}
	for _, storeID := range stores {
		for hour, amount := range hourly {
			if _, err := tx.Exec(ctx, `INSERT INTO hourly_sales (store_id, hour, amount) VALUES ($1,$2,$3)`, storeID, hour, amount); err != nil {
				return err
			}
		}
	}

	// Approvals after promotions/POs exist so links stay valid.
	if _, err := tx.Exec(ctx, `
		INSERT INTO approvals (
			id, type, title, requested_by, requested_at, reason, financial_impact, inventory_impact, risk, status,
			po_id, adjustment_id, promotion_id, requester_user_id, branch_id, payload
		) VALUES
		('APR-8821','inventory','Stock write-off — damaged plush batch','Nusrat Jahan','7 Oct 2026 · 09:14',
		 'Water damage during inbound QC at Dhaka DC',62400,'-48 units SKU-2048','medium','pending',
		 NULL,'ADJ-441',NULL,'u-store',NULL,'{"sku":"SKU-2048","qty":-48,"locationKind":"warehouse","locationId":"WH-BD-DHK-01","productId":"MIN-PL-2048"}'),
		('APR-8824','purchase','PO-2026-00491 — Guangzhou Toys Co.','Karim Jahan','7 Oct 2026 · 08:40',
		 'Rush replenishment for Sanrio IP launch',920000,'+18 SKUs inbound','low','pending',
		 'PO-2026-00491',NULL,NULL,'u-manager',NULL,'{"poId":"PO-2026-00491"}'),
		('APR-8830','price','Promo price — Gel Pen Set weekend deal','Farhana Akter','6 Oct 2026 · 17:22',
		 'Clear aged stationery before new assortment',-18,'Margin −4.2 pts','low','pending',
		 NULL,NULL,'PR-2','u-store-uttara','MIN-BD-DHK-021','{"promotionId":"PR-2"}'),
		('APR-8833','refund','High-value refund — Wireless Earbuds','Rahim Khan','7 Oct 2026 · 10:05',
		 'Defective unit within 7-day window — return to Gulshan stock for QC',2490,'+1 SKU-6611 at Gulshan','medium','pending',
		 NULL,NULL,NULL,'u-store-gulshan','MIN-BD-DHK-008','{"sku":"SKU-6611","productId":"MIN-BT-6611","qty":1,"storeId":"MIN-BD-DHK-008"}'),
		('APR-8840','supplier','Onboard supplier — EcoPack BD','Karim Jahan','6 Oct 2026 · 14:10',
		 'Local packaging partner for BD market',0,'New vendor master','high','pending',
		 NULL,NULL,NULL,'u-manager',NULL,'{"supplier":"EcoPack BD"}')`); err != nil {
		return err
	}

	// A few posted sales so top sellers and customer history share the same lines as store totals.
	return seedSampleSales(ctx, tx)
}

func seedSampleSales(ctx context.Context, tx pgx.Tx) error {
	type line struct {
		product string
		qty     int
		price   int
	}
	batches := []struct {
		id, store, cashier string
		lines              []line
	}{
		{"SAL-DHK-1", "MIN-BD-DHK-014", "st-rafi", []line{{"MIN-PL-2048", 42, 1250}, {"MIN-BG-1102", 38, 850}, {"MIN-ST-3301", 61, 390}}},
		{"SAL-GUL-1", "MIN-BD-DHK-008", "st-mahmud", []line{{"MIN-PL-2048", 30, 1250}, {"MIN-BT-6611", 12, 2490}, {"MIN-BG-1102", 22, 850}}},
		{"SAL-UTT-1", "MIN-BD-DHK-021", "st-nabil", []line{{"MIN-BG-1102", 40, 850}, {"MIN-ST-3301", 28, 390}, {"MIN-BT-5520", 16, 690}}},
		{"SAL-CTG-1", "MIN-BD-CTG-003", "st-rina", []line{{"MIN-HM-4410", 8, 1890}, {"MIN-PL-2048", 14, 1250}, {"MIN-ST-3301", 20, 390}}},
	}
	for _, batch := range batches {
		var total int
		for _, line := range batch.lines {
			total += line.qty * line.price
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO sales (id, store_id, user_id, total, tender, created_at)
			VALUES ($1,$2,$3,$4,'card', now())`, batch.id, batch.store, batch.cashier, total); err != nil {
			return err
		}
		for i, line := range batch.lines {
			if line.qty == 0 {
				continue
			}
			if _, err := tx.Exec(ctx, `
				INSERT INTO sale_lines (id, sale_id, product_id, qty, price)
				VALUES ($1,$2,$3,$4,$5)`,
				fmt.Sprintf("%s-%d", batch.id, i), batch.id, line.product, line.qty, line.price,
			); err != nil {
				return err
			}
		}
	}
	return nil
}

func initials(name string) string {
	out := ""
	for _, part := range splitWords(name) {
		if part == "" {
			continue
		}
		out += string([]rune(part)[0])
		if len(out) == 2 {
			break
		}
	}
	return out
}

func splitWords(name string) []string {
	return stringsFields(name)
}

func stringsFields(s string) []string {
	fields := []string{}
	current := ""
	for _, r := range s {
		if r == ' ' {
			if current != "" {
				fields = append(fields, current)
				current = ""
			}
			continue
		}
		current += string(r)
	}
	if current != "" {
		fields = append(fields, current)
	}
	return fields
}

func parseShift(day time.Time, hhmm string) time.Time {
	var h, m int
	fmt.Sscanf(hhmm, "%d:%d", &h, &m)
	return time.Date(day.Year(), day.Month(), day.Day(), h, m, 0, 0, day.Location())
}
