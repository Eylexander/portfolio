package api

import (
	"net/http"
	"os"
	"runtime"
	"time"

	"eylexander/portfolio/backend/src/consts"
)

var startTime = time.Now()

func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) error {
	healthCheck := consts.HealthCheck{
		Timestamp: time.Now(),
		Version:   getVersion(),
		UptimeMs:  time.Since(startTime).Milliseconds(),
		Services:  make(map[string]consts.ServiceHealth),
	}

	// Check database health
	dbHealth := h.checkDatabaseHealth()
	healthCheck.Services["database"] = dbHealth

	// Check system resources
	sysHealth := h.checkSystemHealth()
	healthCheck.Services["system"] = sysHealth

	// Determine overall health status
	healthCheck.Status = h.determineOverallHealth(healthCheck.Services)

	// Set appropriate HTTP status code
	statusCode := http.StatusOK
	if healthCheck.Status == consts.HealthStatusUnhealthy {
		statusCode = http.StatusServiceUnavailable
	} else if healthCheck.Status == consts.HealthStatusDegraded {
		statusCode = http.StatusOK // Still return 200 for degraded
	}

	return h.WriteJSON(w, statusCode, healthCheck)
}

func (h *Handler) checkDatabaseHealth() consts.ServiceHealth {
	start := time.Now()
	err := h.dataStore.HealthCheck()
	responseTime := time.Since(start)

	if err != nil {
		return consts.ServiceHealth{
			Status:         consts.HealthStatusUnhealthy,
			LastChecked:    time.Now(),
			ResponseTimeMs: responseTime.Milliseconds(),
			Error:          err.Error(),
		}
	}

	status := consts.HealthStatusHealthy
	if responseTime > 1*time.Second {
		status = consts.HealthStatusDegraded
	}

	return consts.ServiceHealth{
		Status:         status,
		LastChecked:    time.Now(),
		ResponseTimeMs: responseTime.Milliseconds(),
	}
}

func (h *Handler) checkSystemHealth() consts.ServiceHealth {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Check memory usage (consider unhealthy if using more than 1GB)
	memoryUsageMB := m.Sys / 1024 / 1024
	status := consts.HealthStatusHealthy

	if memoryUsageMB > 1024 {
		status = consts.HealthStatusDegraded
	}
	if memoryUsageMB > 2048 {
		status = consts.HealthStatusUnhealthy
	}

	return consts.ServiceHealth{
		Status:      status,
		LastChecked: time.Now(),
	}
}

func (h *Handler) determineOverallHealth(services map[string]consts.ServiceHealth) consts.HealthStatus {
	hasUnhealthy := false
	hasDegraded := false

	for _, service := range services {
		switch service.Status {
		case consts.HealthStatusUnhealthy:
			hasUnhealthy = true
		case consts.HealthStatusDegraded:
			hasDegraded = true
		}
	}

	if hasUnhealthy {
		return consts.HealthStatusUnhealthy
	}
	if hasDegraded {
		return consts.HealthStatusDegraded
	}
	return consts.HealthStatusHealthy
}

func getVersion() string {
	if version := os.Getenv("APP_VERSION"); version != "" {
		return version
	}
	return "dev"
}
