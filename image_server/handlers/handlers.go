package handlers

import (
	"ImageServer/fileserver"
	"github.com/pierrre/imageserver"
	imageserver_http "github.com/pierrre/imageserver/http"
	imageserver_http_gift "github.com/pierrre/imageserver/http/gift"
	imageserver_http_image "github.com/pierrre/imageserver/http/image"
	"net/http"
)

func NewImageHTTPHandler(server imageserver.Server) http.Handler {
	return &imageserver_http.Handler{
		Parser: imageserver_http.ListParser([]imageserver_http.Parser{
			&imageserver_http.SourcePathParser{},
			&imageserver_http_gift.ResizeParser{},
			&imageserver_http_image.FormatParser{},
		}),
		Server: server,
	}
}

func NewImageUploadHTTPHandler(server fileserver.UploadServer) http.Handler {
	return &fileserver.Handler{
		Parser: imageserver_http.ListParser([]imageserver_http.Parser{
			&imageserver_http.SourcePathParser{},
			&imageserver_http_gift.ResizeParser{},
			&imageserver_http_image.FormatParser{},
		}),
		Server: server,
	}
}
