package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
)

// APIResponse defines the standard structure for API responses
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// FetchFromSWAPI retrieves data from SWAPI with filters
func FetchFromSWAPI(w http.ResponseWriter, resource, query, page, sortBy, order string) {
	BaseURL := os.Getenv("BASE_URL")
	url := fmt.Sprintf("%s/%s/?search=%s&page=%s", BaseURL, resource, query, page)
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error making request to SWAPI: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Verify response code
	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("SWAPI returned non-200 status: %d", resp.StatusCode), resp.StatusCode)
		return
	}

	// decode json
	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		http.Error(w, fmt.Sprintf("Error decoding SWAPI response: %v", err), http.StatusInternalServerError)
		return
	}

	// validate "results" field
	results, ok := data["results"].([]interface{})
	if !ok {
		http.Error(w, "Invalid response format from SWAPI: missing or invalid 'results' field", http.StatusInternalServerError)
		return
	}

	// Convert []interface{} to []map[string]interface{}
	items := make([]map[string]interface{}, len(results))
	for i, item := range results {
		itemMap, valid := item.(map[string]interface{})
		if !valid {
			http.Error(w, "Invalid item format in results", http.StatusInternalServerError)
			return
		}
		items[i] = itemMap
	}

	// oredring
	if sortBy != "" {
		sortedItems, err := SortData(items, sortBy, order)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error sorting data: %v", err), http.StatusBadRequest)
			return
		}
		data["results"] = sortedItems
	} else {
		data["results"] = items
	}

	// return response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
	}
}

func SortData(data []map[string]interface{}, sortBy, order string) ([]map[string]interface{}, error) {
	ascending := order != "desc"

	sort.Slice(data, func(i, j int) bool {
		valI, okI := data[i][sortBy]
		valJ, okJ := data[j][sortBy]
		if !okI || !okJ {
			return ascending
		}
		switch valI := valI.(type) {
		case string:
			valJ, _ := valJ.(string)
			if ascending {
				return valI < valJ
			}
			return valI > valJ
		case float64:
			valJ, _ := valJ.(float64)
			if ascending {
				return valI < valJ
			}
			return valI > valJ
		default:
			return ascending
		}
	})

	return data, nil
}
