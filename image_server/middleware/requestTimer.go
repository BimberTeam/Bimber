package middleware

import (
	"ImageServer/logger"
	"net/http"
	"time"
)

func RequestTime(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		now := time.Now()
		next.ServeHTTP(w,r)
		elapsed := time.Since(now)
		logger.GetLogger().WithField("prefix" ,"[Request Time]").Info(elapsed)
	})
}