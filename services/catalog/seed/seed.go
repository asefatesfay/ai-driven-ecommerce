package seed

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

	"github.com/ai-ecommerce/catalog/internal/db"
	"github.com/ai-ecommerce/catalog/internal/models"
)

type productSeed struct {
	StyleID     string
	Brand       string
	Name        string
	Description string
	Category    string
	Price       float64
	SalePrice   *float64
	Rating      float64
	ReviewCount int
	ImageURL    string
	BadgeLabel  *string
	BadgeType   *string
	Colors      []models.Color
	Sizes       []string
	Recipients  []string
}

func sp(s string) *string { return &s }
func fp(f float64) *float64 { return &f }

var products = []productSeed{
	{
		StyleID: "7967312", Brand: "Dyson", Name: "Airwrap i.d.™ Multi-styler & Dryer",
		Description: "Styles, dries and curls with no extreme heat damage.",
		Category: "beauty", Price: 599, Rating: 4.8, ReviewCount: 2341,
		ImageURL:   "https://n.nordstrommedia.com/it/8f6660c2-b14a-4ba9-905f-b64255c0aa88.jpeg",
		BadgeLabel: sp("Beauty Exclusive"), BadgeType: sp("beauty-exclusive"),
		Colors:     []models.Color{{Name: "Nickel/Copper", Hex: "#A8A8A0"}, {Name: "Prussian Blue", Hex: "#003153"}},
		Recipients: []string{"her"},
	},
	{
		StyleID: "7967313", Brand: "UGG®", Name: "Tazzette Shearling Slipper",
		Description: "Shearling-lined, cloud-soft slip-on slipper.",
		Category: "shoes", Price: 110, SalePrice: fp(69.99), Rating: 4.7, ReviewCount: 891,
		ImageURL:   "https://n.nordstrommedia.com/it/09fcb8df-7ac0-42ee-b057-7b1a8e5a7d6e.jpeg",
		BadgeLabel: sp("Sale"), BadgeType: sp("sale"),
		Colors:     []models.Color{{Name: "Chestnut", Hex: "#C4915E"}, {Name: "Black", Hex: "#1A1A1A"}, {Name: "Sand", Hex: "#D4B896"}},
		Sizes:      []string{"5", "6", "7", "8", "9", "10", "11"},
		Recipients: []string{"her", "him"},
	},
	{
		StyleID: "6451550", Brand: "Nordstrom", Name: "Moonlight Eco Short Pajamas",
		Description: "Ultra-soft Tencel® modal pajamas, sustainably sourced.",
		Category: "apparel", Price: 68, SalePrice: fp(42.99), Rating: 4.9, ReviewCount: 1203,
		ImageURL:   "https://n.nordstrommedia.com/it/265d9f33-9a4c-4a87-8014-9742ee7674b5.jpeg",
		BadgeLabel: sp("New Markdown"), BadgeType: sp("new-markdown"),
		Colors:     []models.Color{{Name: "Blush", Hex: "#F0C0AD"}, {Name: "Navy", Hex: "#1B3A5C"}, {Name: "Sage", Hex: "#8FAE8C"}},
		Sizes:      []string{"XS", "S", "M", "L", "XL", "XXL"},
		Recipients: []string{"her"},
	},
	{
		StyleID: "7967314", Brand: "Voluspa", Name: "Macaron Candle Trio",
		Description: "Three of Voluspa's most beloved scents in one elegant set.",
		Category: "home", Price: 54, Rating: 4.6, ReviewCount: 478,
		ImageURL:   "https://n.nordstrommedia.com/it/c9563d47-fab1-4816-913b-c0c293db12b9.jpeg",
		BadgeLabel: sp("Gift with Purchase"), BadgeType: sp("gift-with-purchase"),
		Recipients: []string{"her", "him"},
	},
	{
		StyleID: "7967315", Brand: "BLISSY", Name: "Mulberry Silk Pillowcase",
		Description: "100% mulberry silk pillowcase for skin and hair health.",
		Category: "home", Price: 89, SalePrice: fp(54.99), Rating: 4.5, ReviewCount: 672,
		ImageURL:   "https://n.nordstrommedia.com/it/38332911-d9e2-4905-b515-f2d866d29089.jpeg",
		BadgeLabel: sp("Sale"), BadgeType: sp("sale"),
		Colors:     []models.Color{{Name: "Blush", Hex: "#F0C0AD"}, {Name: "White", Hex: "#F5F5F5"}, {Name: "Navy", Hex: "#1B3A5C"}},
		Sizes:      []string{"Standard", "King"},
		Recipients: []string{"her"},
	},
	{
		StyleID: "7967316", Brand: "NODPOD", Name: "Weighted Sleep Mask",
		Description: "Gentle gravity pressure over your eyes for deeper sleep.",
		Category: "wellness", Price: 38, Rating: 4.7, ReviewCount: 1890,
		ImageURL:   "https://n.nordstrommedia.com/it/98dd1913-e3f0-4519-a8b7-3b78f0b5ac5c.jpeg",
		BadgeLabel: sp("Top Rated"), BadgeType: sp("top-rated"),
		Colors:     []models.Color{{Name: "Black", Hex: "#1A1A1A"}, {Name: "Gray", Hex: "#888888"}, {Name: "Blush", Hex: "#F0C0AD"}},
		Recipients: []string{"her", "him"},
	},
	{
		StyleID: "7967317", Brand: "Erin McDermott Jewelry", Name: "Heart Necklace",
		Description: "Delicate gold heart necklace, designed for everyday wear.",
		Category: "accessories", Price: 110, SalePrice: fp(38), Rating: 4.8, ReviewCount: 334,
		ImageURL:   "https://n.nordstrommedia.com/it/f3ef1c5a-af47-4f0c-bf92-ed37e02eff75.jpeg",
		BadgeLabel: sp("Sale"), BadgeType: sp("sale"),
		Colors:     []models.Color{{Name: "Gold", Hex: "#B8962E"}, {Name: "Silver", Hex: "#A0A0A0"}},
		Recipients: []string{"her", "teens"},
	},
	{
		StyleID: "7967318", Brand: "The North Face", Name: "Hydrenalite Down Jacket",
		Description: "Ultra-packable, wind-resistant down jacket.",
		Category: "apparel", Price: 220, Rating: 4.9, ReviewCount: 562,
		ImageURL:   "https://n.nordstrommedia.com/it/a24de572-98ae-4f12-889d-01e9272a849a.jpeg",
		BadgeLabel: sp("Best Seller"), BadgeType: sp("best-seller"),
		Colors:     []models.Color{{Name: "Black", Hex: "#1A1A1A"}, {Name: "Navy", Hex: "#1B3A5C"}, {Name: "Forest", Hex: "#2D5A3D"}},
		Sizes:      []string{"XS", "S", "M", "L", "XL", "XXL"},
		Recipients: []string{"her", "him"},
	},
	{
		StyleID: "7967319", Brand: "New Balance", Name: "327 Sneaker",
		Description: "Vintage silhouette, modern cushioning.",
		Category: "shoes", Price: 100, Rating: 4.6, ReviewCount: 2109,
		ImageURL: "https://n.nordstrommedia.com/it/7f176cd1-ce0c-4391-8776-a09f93107455.jpeg",
		Colors:   []models.Color{{Name: "White/Gray", Hex: "#E8E8E8"}, {Name: "Black", Hex: "#1A1A1A"}},
		Sizes:    []string{"6", "7", "7.5", "8", "8.5", "9", "9.5", "10", "11"},
		Recipients: []string{"her", "him", "teens"},
	},
	{
		StyleID: "7967320", Brand: "tonies", Name: "Toniebox 2 Starter Set",
		Description: "Screen-free audio play for kids ages 3–7.",
		Category: "toys", Price: 99, Rating: 4.9, ReviewCount: 3201,
		ImageURL:   "https://n.nordstrommedia.com/it/29266f06-7cbf-4d1e-ab25-0ae485f055d3.jpeg",
		BadgeLabel: sp("Top Rated"), BadgeType: sp("top-rated"),
		Colors:     []models.Color{{Name: "Teal", Hex: "#2D9B8A"}, {Name: "Purple", Hex: "#7B52AB"}},
		Recipients: []string{"kids"},
	},
}

type editorialSeed struct {
	StyleID   string
	Headline  string
	Copy      string
	Attribution string
	Recipients  []string
	Themes      []string
	Price       string
	SortOrder   int
}

var editorials = []editorialSeed{
	{"7967312", "The Gift She'll Actually Use Every Day",
		"Our Fashion Office can't stop raving about this. It styles, dries, and curls with zero heat damage — the kind of gift that changes a morning routine forever.",
		"fashion-office", []string{"for-her"}, []string{"luxury", "wellness"}, "200-plus", 1},
	{"7967313", "Pure Cozy, Zero Effort",
		"These are the slippers our entire team wears on long shoot days. Shearling-lined, cloud-soft, and the kind of cozy that makes staying in feel like a luxury.",
		"fashion-office", []string{"for-her", "for-him"}, []string{"cozy", "host-gift"}, "50-100", 2},
	{"6451550", "The Softest Thing She'll Own",
		"Made from recycled materials, these pajamas feel impossibly soft and wash beautifully. A thoughtful gift that's good for her and the planet.",
		"buyer", []string{"for-her"}, []string{"cozy", "practical"}, "50-100", 3},
	{"7967314", "The Host Gift That Never Misses",
		"Three of Voluspa's most beloved scents in one elegant set. Wrap it, and you're done.",
		"buyer", []string{"for-her", "for-him"}, []string{"host-gift", "luxury", "stocking-stuffer"}, "50-100", 4},
	{"7967315", "Sleep Like You're at a Hotel Every Night",
		"Once you sleep on silk, there's no going back. Our stylists swear this has changed their skin and hair.",
		"stylist", []string{"for-her"}, []string{"wellness", "luxury", "cozy"}, "50-100", 5},
	{"7967316", "The Secret to a Deeper Sleep",
		"Gentle gravity pressure over your eyes — it sounds simple, but our team became obsessed immediately.",
		"fashion-office", []string{"for-her", "for-him"}, []string{"wellness", "stocking-stuffer", "practical"}, "under-50", 6},
	{"7967317", "Small Gift, Big Feeling",
		"Delicate enough to wear every day, meaningful enough to remember.",
		"fashion-office", []string{"for-her"}, []string{"luxury", "stocking-stuffer"}, "under-50", 7},
	{"7967318", "Warmth That Goes Anywhere",
		"Ultra-packable, wind-resistant, and still looks sharp enough for the city.",
		"buyer", []string{"for-her", "for-him"}, []string{"outdoor", "practical"}, "200-plus", 8},
	{"7967319", "The Sneaker Everyone Will Actually Wear",
		"Vintage silhouette, modern comfort. The 327 has been on our team's feet for two seasons straight.",
		"stylist", []string{"for-her", "for-him", "for-teens"}, []string{"practical", "outdoor"}, "100-200", 9},
	{"7967320", "The Kids' Gift That Gives You Peace Too",
		"Screen-free audio play that kids ages 3–7 operate entirely on their own.",
		"buyer", []string{"for-kids"}, []string{"practical"}, "50-100", 10},
}

// inventorySeed defines starting stock per product
var inventoryStocks = map[string]map[string]map[string]int{
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
	"7967315": {"Standard": {"Blush": 20, "White": 30, "Navy": 15}, "King": {"Blush": 10, "White": 20, "Navy": 8}},
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

func Run(database *sql.DB) error {
	log.Println("seeding database...")

	// Check if already seeded
	var count int
	if err := database.QueryRow("SELECT COUNT(*) FROM products").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		log.Printf("database already has %d products, skipping seed", count)
		return nil
	}

	// Insert products
	styleToID := map[string]int64{}
	for _, ps := range products {
		p := &models.Product{
			StyleID: ps.StyleID, Brand: ps.Brand, Name: ps.Name,
			Description: ps.Description, Category: ps.Category,
			Price: ps.Price, SalePrice: ps.SalePrice,
			Rating: ps.Rating, ReviewCount: ps.ReviewCount,
			ImageURL: ps.ImageURL, BadgeLabel: ps.BadgeLabel, BadgeType: ps.BadgeType,
			Colors: ps.Colors, Sizes: ps.Sizes, Recipients: ps.Recipients,
			Active: true,
		}
		id, err := db.CreateProduct(database, p)
		if err != nil {
			return fmt.Errorf("seed product %s: %w", ps.StyleID, err)
		}
		styleToID[ps.StyleID] = id
		log.Printf("  product %s → id %d", ps.StyleID, id)
	}

	// Insert editorial products
	for _, es := range editorials {
		productID, ok := styleToID[es.StyleID]
		if !ok {
			continue
		}
		recipientJSON, _ := json.Marshal(es.Recipients)
		themeJSON, _ := json.Marshal(es.Themes)

		_, err := database.Exec(`
			INSERT INTO editorial_products
			    (product_id, editorial_headline, editorial_copy, attribution,
			     filter_recipient, filter_theme, filter_price, sort_order, active)
			VALUES (?,?,?,?,?,?,?,?,1)`,
			productID, es.Headline, es.Copy, es.Attribution,
			string(recipientJSON), string(themeJSON), es.Price, es.SortOrder,
		)
		if err != nil {
			return fmt.Errorf("seed editorial %s: %w", es.StyleID, err)
		}
	}

	// Insert inventory
	for styleID, sizeMap := range inventoryStocks {
		productID, ok := styleToID[styleID]
		if !ok {
			continue
		}
		for size, colorMap := range sizeMap {
			for colorName, qty := range colorMap {
				_, err := database.Exec(`
					INSERT INTO inventory (product_id, style_id, size, color_name, quantity)
					VALUES (?,?,?,?,?)`,
					productID, styleID, size, colorName, qty,
				)
				if err != nil {
					return fmt.Errorf("seed inventory %s/%s/%s: %w", styleID, size, colorName, err)
				}
			}
		}
	}

	log.Println("seed complete")
	return nil
}
