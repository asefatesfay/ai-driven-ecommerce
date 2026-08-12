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

func sp(s string) *string   { return &s }
func fp(f float64) *float64 { return &f }

// Products matching nordstrom.com/browse/gifts exactly — real CDN images, real prices.
// The first 4 are the exact products visible in products.png screenshot.
var products = []productSeed{
	{
		// Screenshot card 1 — SALT & STONE 4-Piece Mini Body Mist $48
		StyleID: "SS-BODYMIST-4PK", Brand: "SALT & STONE",
		Name:        "4-Piece Mini Body Mist Discovery Set $48 Value",
		Description: "Four travel-size body mists: Santal & Vetiver, Bergamot & Hinoki, Lavender & Vanilla, Black Rose & Amber.",
		Category: "wellness", Price: 48, Rating: 4.4, ReviewCount: 5969,
		ImageURL:   "https://n.nordstrommedia.com/it/4c4ced36-b66a-4815-ab3a-e2502b009cd8.jpeg",
		BadgeLabel: sp("Gift with Purchase"), BadgeType: sp("gift-with-purchase"),
		Colors:     []models.Color{},
		Recipients: []string{"her"},
	},
	{
		// Screenshot card 2 — Nordstrom Moonlight Eco Knit Pajamas $85 (blue pinstripe)
		StyleID: "6451545", Brand: "Nordstrom",
		Name:        "Moonlight Eco Knit Pajamas",
		Description: "Ultra-soft eco knit pajamas. Button-front top and wide-leg pants in a relaxed, flattering fit.",
		Category: "apparel", Price: 85, Rating: 4.5, ReviewCount: 1232,
		ImageURL:   "https://n.nordstrommedia.com/it/c2543c6f-bc97-4657-a5cb-fbd87d5e2afd.jpeg",
		BadgeLabel: sp("New"), BadgeType: sp("new-markdown"),
		Colors: []models.Color{
			{Name: "Blue Stripe", Hex: "#8BA7C2"},
			{Name: "Navy",        Hex: "#1B3A5C"},
			{Name: "Blush",       Hex: "#F0C0AD"},
			{Name: "Sage",        Hex: "#8FAE8C"},
			{Name: "Black",       Hex: "#1A1A1A"},
			{Name: "Oatmeal",     Hex: "#D4C4A8"},
		},
		Sizes:      []string{"XS", "S", "M", "L", "XL", "XXL"},
		Recipients: []string{"her"},
	},
	{
		// Screenshot card 4 — Maison Francis Kurkdjian Baccarat Rouge 540 Body Oil $125
		StyleID: "MFK-BR540-BODY", Brand: "Maison Francis Kurkdjian",
		Name:        "Baccarat Rouge 540 Scented Body Oil",
		Description: "The iconic Baccarat Rouge 540 fragrance in a luxurious body oil. Amber, woody, floral — a scent that starts a conversation.",
		Category: "beauty", Price: 125, Rating: 3.8, ReviewCount: 126,
		ImageURL:   "https://n.nordstrommedia.com/it/bbb6276b-bb19-4c46-8fa8-09a3cebd8dfd.jpeg",
		BadgeLabel: sp("Gift with Purchase"), BadgeType: sp("gift-with-purchase"),
		Colors:     []models.Color{},
		Recipients: []string{"her", "him"},
	},
	{
		// UGG Tazzette — top-3 on gifts page, screenshot-adjacent
		StyleID: "UGG-TAZZETTE-SC", Brand: "UGG®",
		Name:        "Tazzette Genuine Shearling Collar Slipper",
		Description: "Genuine shearling collar slipper with suede upper and lightweight EVA platform sole.",
		Category: "shoes", Price: 105, Rating: 4.7, ReviewCount: 1108,
		ImageURL:   "https://n.nordstrommedia.com/it/d1180980-1d11-4d3e-8a9d-ef42c2cd73aa.jpeg",
		Colors: []models.Color{
			{Name: "Chestnut", Hex: "#C4915E"},
			{Name: "Black",    Hex: "#1A1A1A"},
			{Name: "Sand",     Hex: "#D4B896"},
			{Name: "Goat",     Hex: "#E8DDD0"},
		},
		Sizes:      []string{"5", "6", "7", "8", "9", "10", "11"},
		Recipients: []string{"her"},
	},
	{
		// Dyson Airwrap — perennial #1 on Nordstrom gift guide
		StyleID: "7967312", Brand: "Dyson",
		Name:        "Airwrap i.d.™ Multi-styler and Dryer Straight+Wavy",
		Description: "Styles, dries and curls with no extreme heat damage. Includes Coanda smoothing dryer, firm and soft smoothing brushes, round volumising brushes, and barrels.",
		Category: "beauty", Price: 649.99, Rating: 4.8, ReviewCount: 2341,
		ImageURL:   "https://n.nordstrommedia.com/it/8f6660c2-b14a-4ba9-905f-b64255c0aa88.jpeg",
		BadgeLabel: sp("Beauty Exclusive"), BadgeType: sp("beauty-exclusive"),
		Colors: []models.Color{
			{Name: "Nickel/Copper",  Hex: "#A8A8A0"},
			{Name: "Prussian Blue",  Hex: "#003153"},
			{Name: "Vinca Blue/Rose", Hex: "#6B8FAE"},
		},
		Recipients: []string{"her"},
	},
	{
		// NODPOD — consistently on the gifts page
		StyleID: "7967316", Brand: "NODPOD",
		Name:        "Sleep Mask",
		Description: "Weighted sleep mask with gentle beaded gravity pressure. Machine washable. Perfect for light sleepers and frequent travelers.",
		Category: "wellness", Price: 38, Rating: 4.7, ReviewCount: 1890,
		ImageURL:   "https://n.nordstrommedia.com/it/b682f67c-dbe4-41a9-83bf-433939ed3c07.jpeg",
		BadgeLabel: sp("Top Rated"), BadgeType: sp("top-rated"),
		Colors: []models.Color{
			{Name: "Black", Hex: "#1A1A1A"},
			{Name: "Gray",  Hex: "#888888"},
			{Name: "Blush", Hex: "#F0C0AD"},
		},
		Recipients: []string{"her", "him"},
	},
}

type editorialSeed struct {
	StyleID     string
	Headline    string
	Copy        string
	Attribution string
	Recipients  []string
	Themes      []string
	Price       string
	SortOrder   int
}

var editorials = []editorialSeed{
	{
		"SS-BODYMIST-4PK",
		"The Stocking Stuffer That Smells Like a Spa",
		"Four scents, one box, zero wrapping required. Our buyers reorder this every year because it photographs beautifully, travels perfectly, and nobody is ever disappointed to receive it.",
		"buyer", []string{"for-her"}, []string{"stocking-stuffer", "wellness", "host-gift"}, "under-50", 1,
	},
	{
		"6451545",
		"The Pajamas That Actually Look Good",
		"Most pajamas are for sleeping. These get worn to the kitchen, on video calls, and everywhere else. The knit is impossibly soft and the fit is relaxed without looking sloppy.",
		"fashion-office", []string{"for-her"}, []string{"cozy", "practical"}, "50-100", 2,
	},
	{
		"MFK-BR540-BODY",
		"The Scent That Starts a Conversation",
		"Baccarat Rouge 540 in a body oil means the scent stays all day — and people ask about it. Our beauty team considers this the most universally admired luxury fragrance gift on the floor.",
		"stylist", []string{"for-her", "for-him"}, []string{"luxury"}, "100-200", 3,
	},
	{
		"UGG-TAZZETTE-SC",
		"Cozy Season's Most Gifted Item",
		"Nine out of ten team members asked for these unprompted. Genuine shearling collar, cloud-light sole. They make staying in feel like a five-star experience.",
		"fashion-office", []string{"for-her"}, []string{"cozy", "host-gift"}, "100-200", 4,
	},
	{
		"7967312",
		"The One Gift That Changes Her Entire Morning",
		"Our Fashion Office has debated many things. This is not one of them. Styles, curls, and dries with zero heat damage — and it genuinely earns permanent counter space.",
		"fashion-office", []string{"for-her"}, []string{"luxury", "wellness"}, "200-plus", 5,
	},
	{
		"7967316",
		"The Secret to a Deeper Sleep",
		"Gentle gravity pressure over your eyes. It sounds simple, but our team became obsessed immediately. Perfect for frequent travelers, light sleepers, or anyone who needs to switch off.",
		"buyer", []string{"for-her", "for-him"}, []string{"wellness", "stocking-stuffer", "practical"}, "under-50", 6,
	},
}

var inventoryStocks = map[string]map[string]map[string]int{
	"SS-BODYMIST-4PK": {"": {"": 120}},
	"6451545": {
		"XS":  {"Blue Stripe": 12, "Navy": 8, "Blush": 10},
		"S":   {"Blue Stripe": 25, "Navy": 20, "Blush": 18, "Sage": 15, "Black": 12},
		"M":   {"Blue Stripe": 30, "Navy": 25, "Blush": 22, "Sage": 18, "Black": 16, "Oatmeal": 14},
		"L":   {"Blue Stripe": 20, "Navy": 18, "Sage": 14, "Black": 12},
		"XL":  {"Navy": 8, "Black": 6, "Oatmeal": 10},
		"XXL": {"Navy": 5, "Oatmeal": 8},
	},
	"MFK-BR540-BODY": {"": {"": 45}},
	"UGG-TAZZETTE-SC": {
		"5":  {"Chestnut": 10, "Black": 6},
		"6":  {"Chestnut": 18, "Black": 14, "Sand": 10, "Goat": 8},
		"7":  {"Chestnut": 22, "Black": 18, "Sand": 12},
		"8":  {"Chestnut": 28, "Black": 22, "Sand": 16, "Goat": 10},
		"9":  {"Chestnut": 16, "Black": 12},
		"10": {"Chestnut": 8, "Black": 5},
		"11": {"Black": 2},
	},
	"7967312": {"": {"Nickel/Copper": 42, "Prussian Blue": 18, "Vinca Blue/Rose": 24}},
	"7967316": {"": {"Black": 55, "Gray": 40, "Blush": 30}},
}

func Run(database *sql.DB) error {
	log.Println("seeding database...")

	var count int
	if err := database.QueryRow("SELECT COUNT(*) FROM products").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		log.Printf("database already has %d products, skipping seed", count)
		return nil
	}

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
