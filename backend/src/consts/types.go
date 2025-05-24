package consts

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Global Types

type Debug struct {
	ID    primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Debug string             `json:"debug"`
}

// Health check types

type HealthStatus string

const (
	HealthStatusHealthy   HealthStatus = "healthy"
	HealthStatusUnhealthy HealthStatus = "unhealthy"
	HealthStatusDegraded  HealthStatus = "degraded"
)

type HealthCheck struct {
	Status    HealthStatus             `json:"status"`
	Timestamp time.Time                `json:"timestamp"`
	Version   string                   `json:"version"`
	UptimeMs  int64                    `json:"uptime_ms"`
	Services  map[string]ServiceHealth `json:"services"`
}

type ServiceHealth struct {
	Status         HealthStatus `json:"status"`
	LastChecked    time.Time    `json:"last_checked"`
	ResponseTimeMs int64        `json:"response_time_ms,omitempty"`
	Error          string       `json:"error,omitempty"`
}

// Storage Types

type StoreResponse struct {
	Message string `json:"message"`
}
