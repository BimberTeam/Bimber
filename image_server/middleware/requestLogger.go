package middleware

import (
	"ImageServer/logger"
	"fmt"
	"net/http"
)

func  contains(arr []string, val string) bool {
	for _, i := range arr {
		if i == val {
			return true
		}
	}
	return false
}

func RequestLogger(logMethods []string)  func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
			if contains(logMethods, r.Method) {
				prefix := fmt.Sprintf("[%s %s]", r.URL.Path, r.Method)
				logger.GetLogger().WithField("prefix", prefix).Info(r.RemoteAddr)
			}
			next.ServeHTTP(w,r)
			return
		})
	}
}