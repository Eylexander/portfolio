package server

import (
	"eylexander/portfolio/backend/src/api"
	"eylexander/portfolio/backend/src/controller"
	"eylexander/portfolio/backend/src/datastore"

	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	api    *api.API
	ctrl   *controller.Controller
}

func NewServer(ds datastore.DataStore) *Server {
	gin.SetMode(gin.ReleaseMode)

	ctrl := controller.NewController(ds)
	apiHandlers := api.NewAPI(ctrl)

	router := gin.Default()
	router.Use(CORSMiddleware())

	s := &Server{
		router: router,
		api:    apiHandlers,
		ctrl:   ctrl,
	}

	s.router.Static("/api/v1/uploads", "./uploads")

	s.registerRoutes()

	return s
}

func (s *Server) registerRoutes() {
	// Health check
	s.router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// API Group
	v1 := s.router.Group("/api/v1")
	{
		// Articles
		v1.GET("/articles", s.api.GetArticles)
		v1.GET("/articles/:slug", OptionalAuthMiddleware(), s.api.GetArticle)

		// Contact
		v1.POST("/contact", s.api.SubmitContact)

		// Auth
		v1.POST("/auth/login", s.api.Login)

		// Protected Routes
		protected := v1.Group("/")
		protected.Use(AuthMiddleware())
		{
			// Article management
			protected.POST("/articles", s.api.CreateArticle)
			protected.GET("/admin/articles", s.api.GetAdminArticles)
			protected.PUT("/articles/:id", s.api.UpdateArticle)
			protected.DELETE("/articles/:id", s.api.DeleteArticle)

			// File uploads
			protected.POST("/upload", s.api.UploadImage)
			protected.GET("/uploads", s.api.ListUploads)

			// Contact message management
			protected.GET("/messages", s.api.GetContactMessages)
			protected.DELETE("/messages/:id", s.api.DeleteContactMessage)

			// Credentials update
			protected.PUT("/auth/credentials", s.api.UpdateCredentials)
			protected.GET("/auth/verify", s.api.VerifyToken)
		}
	}

	s.router.NoRoute(s.DefaultResponse)
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}

func (s *Server) DefaultResponse(c *gin.Context) {
	c.JSON(404, gin.H{"error": "Endpoint not found"})
}
