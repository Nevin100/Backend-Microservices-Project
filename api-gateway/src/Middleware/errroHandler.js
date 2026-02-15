import logger from "../Utils/logger";

const errorHandler = (err, req, res, next) =>{
    logger.error(err.stack);

    res.status(err.status || 500).json({
        message : err.message || 'Internal Server Error'
    })
}

export default errorHandler;