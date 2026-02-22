package controller

import (
	"context"
	"errors"
	"eylexander/portfolio/backend/src/models"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func (c *Controller) Login(ctx context.Context, username, password string) (string, error) {
	user, err := c.ds.GetUserByUsername(ctx, username)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	// Generate JWT
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default-secret-change-me"
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (c *Controller) RegisterAdmin(ctx context.Context, username, password string) error {
	// Check if user exists
	existing, err := c.ds.GetUserByUsername(ctx, username)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := &models.User{
		Username: username,
		Password: string(hashedPassword),
	}

	return c.ds.CreateUser(ctx, user)
}

func (c *Controller) UpdateAdminCredentials(ctx context.Context, currentUsername, newUsername, newPassword string) error {
	user, err := c.ds.GetUserByUsername(ctx, currentUsername)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	// If changing username, check if new username already exists
	if newUsername != "" && newUsername != currentUsername {
		existing, err := c.ds.GetUserByUsername(ctx, newUsername)
		if err != nil {
			return err
		}
		if existing != nil {
			return errors.New("username already taken")
		}
		user.Username = newUsername
	}

	if newPassword != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	}

	return c.ds.UpdateUser(ctx, user)
}
