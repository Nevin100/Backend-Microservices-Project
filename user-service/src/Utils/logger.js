import winston from "winston";

// Logs are categorized by severity levels (error, warn, info, http, verbose, debug, silly)
const logger = winston.createLogger({
    level: process.env.NODE_ENV ==='production' ? 'info' : 'debug',
    // Log format includes timestamp, error stack traces, and structured JSON for better log management and analysis
    format: winston.format.combine(
        // Adds a timestamp to each log entry for better traceability
        winston.format.timestamp(),

        // Captures error stack traces in logs for easier debugging of exceptions
        winston.format.errors({stack: true}),

        // Allows for string interpolation in log messages (e.g., logger.info('User %s logged in', username))
        winston.format.splat(),

        // Formats logs as JSON for better integration with log management systems and easier parsing
        winston.format.json()
    ),
    // Default metadata included in all logs (e.g., service name) to help identify the source of logs in a microservices architecture
    defaultMeta: {
        service : 'user-service'},

    // Transports define where logs are sent (console, files, external services)
    transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    // Colorize logs for better readability in development.. error logs in red, warnings in yellow, info in green, etc.
                    winston.format.colorize(),

                    // Simple format for console logs (timestamp and message) to keep them concise and easy to read during development
                    winston.format.simple()
                ),
            }),
            // File transport for error logs, storing only error-level logs in 'error-log' file for focused debugging of issues
            new winston.transports.File({filename : 'error-log', level : 'error'}),
            // File transport for all logs, storing all log levels in 'combined.log' for comprehensive log history and analysis
            new winston.transports.File({filename: 'combined.log'})
        ]
})

export default logger

