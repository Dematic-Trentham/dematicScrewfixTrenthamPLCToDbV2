import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Ensure logs are stored in the "logs" directory
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "/../logs");

// Configure daily rotating file transport
const transport = new DailyRotateFile({
	dirname: logDir, // Save logs inside "logs" directory
	filename: "app-%DATE%.log", // Example: app-2025-03-11.log
	datePattern: "YYYY-MM-DD", // Creates a new log file every day
	maxFiles: "30d", // Keeps logs for 30 days, deletes older files
	zippedArchive: false, // Set to true to compress old logs
});

// Create the Winston logger
const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level.toUpperCase()}]: ${message}`;
		})
	),
	transports: [
		transport, // Log to rotating files
		new winston.transports.Console(), // Also log to console
	],
});

// Export the singleton logger
export default logger;
