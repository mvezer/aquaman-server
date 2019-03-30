const MQTT = require("async-mqtt");
const EventEmitter = require('events');

class MQTTmanager extends EventEmitter {
    constructor(connectionParams) {
        super();
        this.connectionParams = connectionParams;
        this.client = null;
    }

    static get EVENT_CONNECT() { return 'connect'; }
    static get EVENT_MESSAGE() { return 'message'; }


    createConnectionString({ ip, port }) {
        return `mqtt://${ip}:${port}`;
    }

    init() {
        if (this.client !== null) {
            console.warn('The MQTT client is already connected');
            return;
        }

        this.client = MQTT.connect(this.createConnectionString(this.connectionParams));
        this.client.on(MQTTmanager.EVENT_CONNECT, this.onConnect.bind(this));
        this.client.on(MQTTmanager.EVENT_MESSAGE, this.onMessage.bind(this));
    }

    async subscribe(topic) {
        try {
            await this.client.subscribe(topic);
        } catch (error) {
            console.error(error);
            process.exit();
        }
    }

    publish(topic, message) {
        return this.client.publish(topic, message);
    }

    onConnect() {
        this.emit(MQTTmanager.EVENT_CONNECT);
    }

    onMessage(topic, messageJSON) {
        const messageObj = JSON.parse(messageJSON);
        this.emit(MQTTmanager.EVENT_MESSAGE, { topic, messageObj });
    }
}

module.exports = MQTTmanager;
