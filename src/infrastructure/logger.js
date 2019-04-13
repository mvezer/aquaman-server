const SimpleLogger = require('simple-node-logger');

const logDirectory = process.env.LOG_DIR || 'log';
const createOpts = (domain, level) => {
    return {
        errorEventName:'error',
            logDirectory,
            fileNamePattern:'aquaman-<DATE>.log',
            dateFormat:'YYYY.MM.DD',
            domain,
            level
    };
};

module.exports = (loggerCategory, logLevel) => {
    const log = SimpleLogger.createRollingFileLogger(createOpts(`[${loggerCategory}]`, logLevel || 'info'));
    log.addAppender(new SimpleLogger.appenders.ConsoleAppender());
    return log;
};