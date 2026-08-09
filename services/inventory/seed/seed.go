package seed

import (
	"database/sql"
	"log"
)

// stocks maps style_id → size → color → quantity, matching catalog seed data.
var stocks = map[string]map[string]map[string]int{
	"7967312": {"": {"Nickel/Copper": 42, "Prussian Blue": 18}},
	"7967313": {
		"5": {"Chestnut": 12, "Black": 8}, "6": {"Chestnut": 20, "Black": 15, "Sand": 10},
		"7": {"Chestnut": 18, "Black": 12}, "8": {"Chestnut": 25, "Black": 20},
		"9": {"Chestnut": 15, "Black": 10}, "10": {"Chestnut": 8, "Black": 5}, "11": {"Black": 2},
	},
	"6451550": {
		"XS": {"Blush": 10, "Navy": 8}, "S": {"Blush": 22, "Navy": 18, "Sage": 15},
		"M": {"Blush": 30, "Navy": 25, "Sage": 20}, "L": {"Blush": 18, "Navy": 14, "Sage": 12},
		"XL": {"Blush": 0, "Navy": 5, "Sage": 3}, "XXL": {"Navy": 8, "Sage": 6},
	},
	"7967314": {"": {"": 65}},
	"7967315": {
		"Standard": {"Blush": 20, "White": 30, "Navy": 15},
		"King":     {"Blush": 10, "White": 20, "Navy": 8},
	},
	"7967316": {"": {"Black": 45, "Gray": 30, "Blush": 22}},
	"7967317": {"": {"Gold": 35, "Silver": 28}},
	"7967318": {
		"XS": {"Black": 5, "Navy": 8}, "S": {"Black": 12, "Navy": 15, "Forest": 10},
		"M": {"Black": 20, "Navy": 18, "Forest": 14}, "L": {"Black": 15, "Navy": 12, "Forest": 10},
		"XL": {"Black": 8, "Navy": 6}, "XXL": {"Black": 3},
	},
	"7967319": {
		"6": {"White/Gray": 8, "Black": 5}, "7": {"White/Gray": 12, "Black": 10},
		"8": {"White/Gray": 20, "Black": 18}, "8.5": {"White/Gray": 15, "Black": 14},
		"9": {"White/Gray": 10, "Black": 9}, "10": {"White/Gray": 6, "Black": 5},
	},
	"7967320": {"": {"Teal": 38, "Purple": 25}},
}

// productIDs maps style_id → product_id, matching catalog seed insert order.
var productIDs = map[string]int{
	"7967312": 1,
	"7967313": 2,
	"6451550": 3,
	"7967314": 4,
	"7967315": 5,
	"7967316": 6,
	"7967317": 7,
	"7967318": 8,
	"7967319": 9,
	"7967320": 10,
}

func Run(database *sql.DB) error {
	var count int
	if err := database.QueryRow("SELECT COUNT(*) FROM inventory").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		log.Printf("inventory already has %d records, skipping seed", count)
		return nil
	}

	log.Println("seeding inventory...")
	for styleID, sizeMap := range stocks {
		productID := productIDs[styleID]
		for size, colorMap := range sizeMap {
			for colorName, qty := range colorMap {
				_, err := database.Exec(`
					INSERT INTO inventory (product_id, style_id, size, color_name, quantity)
					VALUES (?,?,?,?,?)`,
					productID, styleID, size, colorName, qty,
				)
				if err != nil {
					return err
				}
			}
		}
	}
	log.Println("inventory seed complete")
	return nil
}
