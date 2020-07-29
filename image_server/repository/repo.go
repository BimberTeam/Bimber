package repository

import (
	"ImageServer/logger"
	"ImageServer/server_error"
	_ "fmt"
	"net/http"

	"github.com/neo4j/neo4j-go-driver/neo4j"
)

type repo struct {
	driver neo4j.Driver
}

type Neo4jConnectionUri struct {
	User     string
	Password string
	Uri      string
}

var Repo *repo = &repo{}

func (r *repo) Connect(uri Neo4jConnectionUri) error {
	config := func(conf *neo4j.Config) { conf.Encrypted = false }
	driver, err := neo4j.NewDriver(uri.Uri, neo4j.BasicAuth(uri.User, uri.Password, ""), config)

	if err != nil {
		return err
	}

	r.driver = driver
	return nil
}

func (r *repo) VerifyToken(profileId string, token string) (verified bool, err error) {
	log := logger.GetLogger()

	defer func() {
		if err != nil {
			logger.GetLogger().Error(err)
		}
	}()

	sessionConfig := neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite}
	session, err := r.driver.NewSession(sessionConfig)
	if err != nil {
		return
	}
	defer session.Close()

	log.Infof("Searching for user: %s", profileId)

	// result, err := session.Run("MATCH (this: User { id: $id }) RETURN this", map[string]interface{}{
	// 	"id": profileId,
	// })
	result, err := session.Run("MATCH (this: User {id: $id} ) RETURN this.accessToken", map[string]interface{}{
		"id": profileId,
	})

	if result == nil {
		err = server_error.New("result is nill what the fuck", http.StatusInternalServerError)
		return
	}

	if err != nil {
		return
	}
	if err = result.Err(); err != nil {
		return
	}

	if !result.Next() {
		err = server_error.New("could not find user", http.StatusNotFound)
		return
	}

	accessToken := result.Record().GetByIndex(0)
	log.Debugf("AccessToken: $s", accessToken)
	verified = accessToken == token
	return
}

func (r *repo) Close() error {
	return r.driver.Close()
}
