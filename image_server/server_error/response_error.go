package server_error

import "fmt"

type ResponseError struct {
	StatusCode int    `json:"status_code"`
	Message    string `json:"message"`
}

func New(message string, statusCode int) *ResponseError {
	return &ResponseError{StatusCode: statusCode, Message: message}
}

func (err *ResponseError) Error() string {
	return fmt.Sprintf("responser error: { message: %s, status_code: %d }", err.Message, err.StatusCode)
}
