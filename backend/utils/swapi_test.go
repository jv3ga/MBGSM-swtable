package utils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

// Simulación del servidor para SWAPI
func mockSWAPIServer(responseBody string, statusCode int) *httptest.Server {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(statusCode)
		w.Write([]byte(responseBody))
	})
	return httptest.NewServer(handler)
}

// Prueba para la función FetchFromSWAPI
func TestFetchFromSWAPI(t *testing.T) {
	// Simular el servidor SWAPI
	mockResponse := `{"results": [{"name": "Luke Skywalker", "height": "172"}, {"name": "Darth Vader", "height": "202"}]}`
	server := mockSWAPIServer(mockResponse, http.StatusOK)
	defer server.Close()

	// Configurar la URL base temporal
	os.Setenv("BASE_URL", server.URL)

	// Crear un ResponseRecorder para capturar la respuesta
	rr := httptest.NewRecorder()

	// Ejecutar la función bajo prueba
	FetchFromSWAPI(rr, "people", "", "1", "height", "asc")

	// Verificar el código de estado
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Comprobar el cuerpo de la respuesta
	var actual map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &actual); err != nil {
		t.Fatalf("Error parsing response: %v", err)
	}

	// Validar la respuesta esperada
	results, ok := actual["results"].([]interface{})
	if !ok {
		t.Fatalf("Expected 'results' to be an array, but got %T", actual["results"])
	}

	if len(results) != 2 {
		t.Errorf("Expected 2 results, got %d", len(results))
	}

	// Validar el orden y los datos
	firstResult := results[0].(map[string]interface{})
	if firstResult["name"] != "Luke Skywalker" {
		t.Errorf("Expected first result to be Luke Skywalker, got %s", firstResult["name"])
	}

	secondResult := results[1].(map[string]interface{})
	if secondResult["name"] != "Darth Vader" {
		t.Errorf("Expected second result to be Darth Vader, got %s", secondResult["name"])
	}
}
