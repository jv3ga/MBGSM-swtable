package handlers

import (
	"backend/utils"
	"net/http"
)

type APIError struct {
	Message string `json:"message"`
}

func getQueryStringValues(r *http.Request) (string, string, string, string) {
	// Extract values from de querystring
	query := r.URL.Query().Get("search")
	page := r.URL.Query().Get("page")
	sortBy := r.URL.Query().Get("sortBy")
	order := r.URL.Query().Get("order")
	return query, page, sortBy, order
}

func GetPlanets(w http.ResponseWriter, r *http.Request) {
	query, page, sortBy, order := getQueryStringValues(r)
	utils.FetchFromSWAPI(w, "planets", query, page, sortBy, order)
}

func GetPeople(w http.ResponseWriter, r *http.Request) {
	query, page, sortBy, order := getQueryStringValues(r)
	utils.FetchFromSWAPI(w, "people", query, page, sortBy, order)
}
