package main

import (
	"backend/handlers"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

// Middleware to handle CORS
func enableCORS(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			// allow origin on dev
			if origin == "" {
				next.ServeHTTP(w, r)
				return
			}
			allowedOriginWithScheme := "http://" + allowedOrigin
			if origin == allowedOriginWithScheme || origin == "https://"+allowedOrigin {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else {
				w.WriteHeader(http.StatusForbidden)
				return
			}
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println(".env file not found, relying on system environment variables")
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		log.Fatal("ALLOWED_ORIGIN is not set")
	}

	r := mux.NewRouter()
	// endpoints
	r.HandleFunc("/api/people", handlers.GetPeople).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/planets", handlers.GetPlanets).Methods("GET", "OPTIONS")

	http.Handle("/", enableCORS(allowedOrigin)(r))

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
