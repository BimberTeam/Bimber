package authorization

import (
	"ImageServer/repository"
	"ImageServer/server_error"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func writeError(w http.ResponseWriter, err error) {
	error := err.(*server_error.ResponseError)
	w.WriteHeader(error.StatusCode)
	_ = json.NewEncoder(w).Encode(&error)
}

func ImageMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost && r.Method != http.MethodDelete {
			next.ServeHTTP(w, r)
			return
		}

		vars := mux.Vars(r)
		token := r.Header.Get("Authorization")

		if profileId, ok := vars["profile_id"]; !ok {
			writeError(w, &server_error.ResponseError{StatusCode: http.StatusBadRequest, Message: "could not fetch profile_id from request's url"})
			return
		} else {
			if authorized, err := repository.Repo.VerifyToken(profileId, token); err != nil {
				writeError(w, err)
				return
			} else {
				if !authorized {
					writeError(w, &server_error.ResponseError{StatusCode: http.StatusUnauthorized, Message: "invalid authorizaton token"})
					return
				}
				next.ServeHTTP(w, r)
				return
			}

		}
	})
}
