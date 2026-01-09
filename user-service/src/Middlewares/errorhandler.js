import logger from "../Utils/logger.js"

// Error Handler Middleware :
const errorHandler = (err, req, res, next) => {
    logger.error(err.stack)

    res.status(err.status || 500).json({
        message : err.message || "Internal Server issue "
    })
}

export default errorHandler