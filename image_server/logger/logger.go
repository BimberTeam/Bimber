package logger

import (
	"github.com/sirupsen/logrus"
	"github.com/x-cray/logrus-prefixed-formatter"
	"sync"
)

var loggerInstance *logrus.Logger
var loggerOnce sync.Once

func initialize(logger *logrus.Logger) *logrus.Logger {
	logger = logrus.New()
	customFormatter := new(prefixed.TextFormatter)
	customFormatter.TimestampFormat = "02-01-2006 15:04:05"
	customFormatter.ForceColors = true
	customFormatter.ForceFormatting  = true
	customFormatter.FullTimestamp = true

	logger.SetFormatter(customFormatter)
	logger.SetReportCaller(true)


	logger.Level = logrus.DebugLevel
	return logger
}


func GetLogger() *logrus.Logger {
	loggerOnce.Do(func() {
		loggerInstance = initialize(loggerInstance)
	})
	return loggerInstance
}

func SetDebug(debug bool) {
	if debug {
		loggerInstance.Level = logrus.DebugLevel
	} else {
		loggerInstance.Level = logrus.InfoLevel
	}
}