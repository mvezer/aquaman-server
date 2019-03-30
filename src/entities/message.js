const moment = require('moment');

class Message {
    constructor(deviceId, command, payload, timestamp) {
        this.deviceId = deviceId;
        this.payload = payload;
        this.timestamp = timestamp === 'none' ? moment() : moment.unix(timestamp);
        this.command = command;
    }

    static fromMQTTmessage({ topic, messageObj }) {
        if (!messageObj.hasOwnProperty('deviceId') || !messageObj.hasOwnProperty('timestamp') || !messageObj.hasOwnProperty('command')) {
            throw new Error('Message parsing problem')
        }

        return new Message(
            messageObj.deviceId,
            messageObj.command,
            messageObj.payload ? messageObj.payload : {},
            messageObj.timestamp
        );
    }

    toMQTTmessage(topic) {
        return [
            topic,
            JSON.stringify({
                deviceId: this.deviceId,
                timestamp: this.timestamp.unix(),
                command: this.command,
                payload: this.payload
            })
        ]
    }

    toString() {
        return JSON.stringify({
            deviceId: this.deviceId,
            timestamp: this.timestamp.format('YYYY-MM-DD HH:mm:ss'),
            command: this.command,
            payload: this.payload,
        }, null, 4);
    }
}

module.exports = Message;