package config

import (
	"ImageServer/repository"

	"github.com/joeshaw/envdecode"
)

type Config struct {
	ImageDir      string `env:"IMAGE_DIR,required"`
	Port          string `env:"PORT,default=8080"`
	Neo4jUser     string `env:"NEO4J_USER,required"`
	Neo4jPassword string `env:"NEO4J_PASSWORD,required"`
	Neo4jUri      string `env:"NEO4J_URI,required"`
}

func LoadServerConfig() (Config, error) {
	var cfg Config
	err := envdecode.Decode(&cfg)
	return cfg, err
}

func ServerConfigToDBUri(config Config) repository.Neo4jConnectionUri {
	return repository.Neo4jConnectionUri{
		Uri:      config.Neo4jUri,
		User:     config.Neo4jUser,
		Password: config.Neo4jPassword,
	}
}
