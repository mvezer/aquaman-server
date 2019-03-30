const SimpleLogger = require('simple-node-logger');
const logManager = new SimpleLogger();
logManager.createConsoleAppender();
logManager.createFileAppender( { logFilePath:process.env.LOG_FILE || 'aquaman.log' } );

module.exports = (loggerCategory, logLevel) => {
    return logManager.createLogger(`[${loggerCategory}]`, logLevel || 'info');
};