package models

import "time"

type UserRole string

const (
	RoleCustomer UserRole = "customer"
	RoleAdmin    UserRole = "admin"
)

type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Role         UserRole  `json:"role"`
	AvatarURL    string    `json:"avatar_url,omitempty"`
	PhoneNumber  string    `json:"phone_number,omitempty"`
	Verified     bool      `json:"verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UserWithPassword struct {
	User
	PasswordHash string `json:"-"`
}

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User        User   `json:"user"`
	AccessToken string `json:"access_token"`
}

type UpdateProfileRequest struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	PhoneNumber string `json:"phone_number"`
	AvatarURL   string `json:"avatar_url"`
}

type Address struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	Label      string    `json:"label"` // home|work|other
	Line1      string    `json:"line1"`
	Line2      string    `json:"line2,omitempty"`
	City       string    `json:"city"`
	State      string    `json:"state"`
	PostalCode string    `json:"postal_code"`
	Country    string    `json:"country"`
	IsDefault  bool      `json:"is_default"`
	CreatedAt  time.Time `json:"created_at"`
}
