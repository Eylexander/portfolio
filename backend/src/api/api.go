package api

import (
	"eylexander/portfolio/backend/src/controller"
)

type API struct {
	ctrl *controller.Controller
}

func NewAPI(ctrl *controller.Controller) *API {
	return &API{ctrl: ctrl}
}
