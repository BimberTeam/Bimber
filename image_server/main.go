package main

import (
	"ImageServer/authorization"
	"ImageServer/config"
	"ImageServer/fileserver"
	"ImageServer/handlers"
	"ImageServer/logger"
	"ImageServer/middleware"
	"ImageServer/repository"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/pierrre/imageserver/image/jpeg"
	_ "github.com/pierrre/imageserver/image/png"
)

const UUID = `[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}`

func main() {

	log := logger.GetLogger()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	log.Info("Loaded .env file")

	cfg, err := config.LoadServerConfig()
	if err != nil {
		log.Fatal("Error while loading environmental variables: " + err.Error())
	}
	log.Info("Loaded environmental variables")

	err = repository.Repo.Connect(config.ServerConfigToDBUri(cfg))
	if err != nil {
		log.Fatal("Failed to connect to database: " + err.Error())
	}
	log.Info("Connected with database")
	defer repository.Repo.Close()

	srv := fileserver.New(cfg)

	imageHandler := handlers.NewImageHTTPHandler(srv)
	uploadHandler := handlers.NewImageUploadHTTPHandler(srv)

	router := mux.NewRouter()
	middlewares := []mux.MiddlewareFunc{
		authorization.ImageMiddleware,
		middleware.RequestTime,
		middleware.RequestLogger([]string{http.MethodPost, http.MethodGet, http.MethodDelete}),
	}
	router.Use(middlewares...)

	router.PathPrefix("/image").Handler(http.StripPrefix("/image/", imageHandler)).Methods(http.MethodGet)
	router.Handle(
		fmt.Sprintf("/image/{profile_id:%s}", UUID),
		http.StripPrefix("/image/", uploadHandler)).Methods(http.MethodPost, http.MethodDelete)

	log.Info("server running on port ", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
