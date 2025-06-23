const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Crear carpeta logs si no existe
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = winston.createLogger({
  level: "debug", 
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    // Transport para home.log
    new winston.transports.File({ filename: path.join(logsDir, "home.log") }),

    // Transport adicional para server.log
    new winston.transports.File({ filename: path.join(logsDir, "server.log"), level: "info" })
  ]
});

module.exports = logger;
