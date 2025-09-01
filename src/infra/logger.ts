import winston from 'winston';
import { config } from '../config';

/**
 * Configures a Winston logger for the application.
 * Logs messages to the console with timestamp, colored level, and custom format.
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL, // Logging level from config (e.g., 'info', 'debug', 'error')
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to each log
    winston.format.colorize(),  // Colorize log level for better readability
    winston.format.printf(({ timestamp, level, message }) => 
      `${timestamp} [${level}]: ${message}` // Custom log format
    )
  ),
  transports: [
    new winston.transports.Console(), // Output logs to console
  ],
});

export default logger;
