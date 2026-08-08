package db

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/ai-ecommerce/user/internal/models"
)

func CreateUser(db *sql.DB, req models.RegisterRequest) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	res, err := db.Exec(
		`INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)`,
		req.Email, string(hash), req.FirstName, req.LastName,
	)
	if err != nil {
		return nil, fmt.Errorf("insert user: %w", err)
	}
	id, _ := res.LastInsertId()
	return GetUser(db, id)
}

func GetUser(db *sql.DB, id int64) (*models.User, error) {
	var u models.User
	err := db.QueryRow(
		`SELECT id, email, first_name, last_name, role, avatar_url, phone_number, verified, created_at, updated_at
		 FROM users WHERE id = ?`, id,
	).Scan(&u.ID, &u.Email, &u.FirstName, &u.LastName, &u.Role,
		&u.AvatarURL, &u.PhoneNumber, &u.Verified, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

func GetUserByEmail(db *sql.DB, email string) (*models.UserWithPassword, error) {
	var u models.UserWithPassword
	err := db.QueryRow(
		`SELECT id, email, password_hash, first_name, last_name, role, avatar_url, phone_number, verified, created_at, updated_at
		 FROM users WHERE email = ?`, email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FirstName, &u.LastName, &u.Role,
		&u.AvatarURL, &u.PhoneNumber, &u.Verified, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

func AuthenticateUser(db *sql.DB, req models.LoginRequest) (*models.User, string, error) {
	u, err := GetUserByEmail(db, req.Email)
	if err != nil {
		return nil, "", err
	}
	if u == nil {
		return nil, "", nil
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", nil
	}
	token, err := generateToken()
	if err != nil {
		return nil, "", err
	}
	expiresAt := time.Now().Add(30 * 24 * time.Hour)
	_, err = db.Exec(
		"INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
		u.ID, token, expiresAt,
	)
	if err != nil {
		return nil, "", fmt.Errorf("create session: %w", err)
	}
	return &u.User, token, nil
}

func UpdateProfile(db *sql.DB, id int64, req models.UpdateProfileRequest) (*models.User, error) {
	_, err := db.Exec(
		`UPDATE users SET first_name=?, last_name=?, phone_number=?, avatar_url=?, updated_at=datetime('now') WHERE id=?`,
		req.FirstName, req.LastName, req.PhoneNumber, req.AvatarURL, id,
	)
	if err != nil {
		return nil, err
	}
	return GetUser(db, id)
}

func GetAddresses(db *sql.DB, userID int64) ([]models.Address, error) {
	rows, err := db.Query(
		`SELECT id, user_id, label, line1, line2, city, state, postal_code, country, is_default, created_at
		 FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []models.Address
	for rows.Next() {
		var a models.Address
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.Label, &a.Line1, &a.Line2, &a.City,
			&a.State, &a.PostalCode, &a.Country, &a.IsDefault, &a.CreatedAt,
		); err != nil {
			return nil, err
		}
		addresses = append(addresses, a)
	}
	return addresses, nil
}

func CreateAddress(db *sql.DB, addr models.Address) (*models.Address, error) {
	if addr.IsDefault {
		db.Exec("UPDATE addresses SET is_default=0 WHERE user_id=?", addr.UserID) //nolint:errcheck
	}
	res, err := db.Exec(
		`INSERT INTO addresses (user_id, label, line1, line2, city, state, postal_code, country, is_default)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		addr.UserID, addr.Label, addr.Line1, addr.Line2, addr.City,
		addr.State, addr.PostalCode, addr.Country, addr.IsDefault,
	)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	addr.ID = id
	return &addr, nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
