const EventEmitter = require('events');
const MQTTmanager = require('../infrastructure/mqttManager');
const Message = require('../entities/message');
const log = require('../infrastructure/logger')('MessageInteractor');

class MessageInteractor extends EventEmitter {
    constructor(mqttManager) {
        super();
        this.mqttManager = mqttManager;
    }

    static get TOPIC_REPORT() { return 'report'; }
    static get TOPIC_CONTROL() { return 'control'; }

    static get EVENT_CONNECT() { return 'connect'; }
    static get EVENT_MESSAGE() { return 'message'; }

    init() {
        this.mqttManager.init();
        this.mqttManager.on(MQTTmanager.EVENT_CONNECT, this.onConnect.bind(this));
        this.mqttManager.on(MQTTmanager.EVENT_MESSAGE, this.onMessage.bind(this));
    }

    async onConnect() {
        await this.mqttManager.subscribe(MessageInteractor.TOPIC_REPORT);
        this.emit(MessageInteractor.EVENT_CONNECT);
    }

    onMessage(mqttMessage) {
        const message = Message.fromMQTTmessage(mqttMessage);
        log.info(`Message received: ${message.toString()}`);
        this.emit(MessageInteractor.EVENT_MESSAGE, message);
    }

    send(message) {
        return this.mqttManager.publish(...message.toMQTTmessage(MessageInteractor.TOPIC_CONTROL));
    }
}
module.exports = MessageInteractor;