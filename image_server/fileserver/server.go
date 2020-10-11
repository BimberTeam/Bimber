package fileserver

import (
	"ImageServer/config"
	"ImageServer/fileserver/cache"
	"crypto/sha256"
	"encoding/hex"
	"github.com/disintegration/gift"
	"github.com/pierrre/imageserver"
	_ "github.com/pierrre/imageserver/cache/file"
	imageserver_http "github.com/pierrre/imageserver/http"
	imageserver_image "github.com/pierrre/imageserver/image"
	imageserver_image_gift "github.com/pierrre/imageserver/image/gift"
	"hash"
	"io"
	"net/http"
	"sync"
)


type FileServer struct {
	Handler imageserver.Handler
	Cache cache.Cache
	KeyGenerator KeyGenerator
}

func New(cfg config.Config) *FileServer {
	mountDirectory := cfg.ImageDir
	cch := cache.New(mountDirectory)
	srv := &FileServer{
		Cache: cch,
		Handler: &imageserver_image.Handler{
			Processor: &imageserver_image_gift.ResizeProcessor{
				DefaultResampling: gift.LanczosResampling,
			},
		},
		KeyGenerator: NewParamsHashKeyGenerator(sha256.New),
	}
	return srv
}


func (s *FileServer) Get(params imageserver.Params) (*imageserver.Image, error) {
	key := s.KeyGenerator.GetKey(params)
	im, err := s.Cache.Get(key, params)
	if err != nil {
		return nil, err
	}
	if im == nil {
		return nil, &imageserver_http.Error{Code: http.StatusNotFound, Text: "image has not been found"}
	}
	if s.Handler != nil {
		if im, err = s.Handler.Handle(im, params); err != nil {
			return nil, err
		}
		return im, nil
	}
	return im, nil
}

func (s *FileServer) Upload(im *imageserver.Image, params imageserver.Params) (interface{}, error) {
	key := s.KeyGenerator.GetKey(params)

	im, err := s.Handler.Handle(im, params)
	if err != nil { return nil, err}

	err = s.Cache.Set(key, im, params)
	if err != nil { return nil, err}

	return map[string] string {"message": "image has been uploaded"}, nil
}

func (s *FileServer) Delete(params imageserver.Params) (interface{}, error) {
	key := s.KeyGenerator.GetKey(params)

	if err := s.Cache.Delete(key); err != nil {
		return nil, err
	}
	return map[string] string {"message": "image has been deleted"}, nil
}

// KeyGenerator represents a Cache key generator.
type KeyGenerator interface {
	GetKey(imageserver.Params) string
}

// KeyGeneratorFunc is a KeyGenerator func.
type KeyGeneratorFunc func(imageserver.Params) string

// GetKey implements KeyGenerator.
func (f KeyGeneratorFunc) GetKey(params imageserver.Params) string {
	return f(params)
}

// NewParamsHashKeyGenerator returns a new KeyGenerator that hashes the Params.
func NewParamsHashKeyGenerator(newHashFunc func() hash.Hash) KeyGenerator {
	pool := &sync.Pool{
		New: func() interface{} {
			return newHashFunc()
		},
	}
	return KeyGeneratorFunc(func(params imageserver.Params) string {
		h := pool.Get().(hash.Hash)
		_, _ = io.WriteString(h, params["source"].(string))
		data := h.Sum(nil)
		h.Reset()
		pool.Put(h)
		return hex.EncodeToString(data)
	})
}
