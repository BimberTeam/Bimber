package cache

import (
	"github.com/pierrre/imageserver"
	imageserver_cache_file "github.com/pierrre/imageserver/cache/file"
	"os"
	"path/filepath"
)

type Cache interface {
	Get(key string, params imageserver.Params) (*imageserver.Image, error)

	Set(key string, image *imageserver.Image, params imageserver.Params) error

	Delete(key string) error
}

func New(path string) *fileCache {
	return &fileCache{Path: path, cache: &imageserver_cache_file.Cache{Path: path}}
}

type fileCache struct {
	Path string
	cache *imageserver_cache_file.Cache
}


func (fc *fileCache) Get(key string, params imageserver.Params) (*imageserver.Image, error) {
	return fc.cache.Get(key, params)
}

func (fc *fileCache) Set(key string, image *imageserver.Image, params imageserver.Params) error {
	return fc.cache.Set(key, image, params)
}

func (fc *fileCache) Delete(key string) error {
	return os.Remove(filepath.Join(fc.Path, key))
}
