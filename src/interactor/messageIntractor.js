const EventEmitter = require('events');
const MQTTmanager = require('../infrastructure/mqttManager');
const Message = require('../entities/message');
const log = require('../infrastructure/logger')('MessageInteractor');

class MessageInteractor extends EventEmitter {
    constructor(mqttManager) {
        super();
        this.mqttManager = mqttManager;

        this.commandParserMap = new Map();
        this.commandParserMap.set(MessageInteractor.COMMAND_REQUEST_SYNC_TIME, this.onSyncTimeRequest.bind(this));
        this.commandParserMap.set(MessageInteractor.COMMAND_TOGGLE_REQUEST, this.onToggleRequest.bind(this));
        this.commandParserMap.set(MessageInteractor.COMMAND_REPORT_STATUS, this.onStatusReport.bind(this));
    }

    static get TOPIC_REPORT() { return 'report'; }
    static get TOPIC_CONTROL() { return 'control'; }

    static get EVENT_CONNECT() { return 'connect'; }
    static get EVENT_MESSAGE() { return 'message'; }
    static get EVENT_SYNC_TIME_REQUEST() { return 'sync_request'; }
    static get EVENT_TOGGLE_REQUEST() { return 'toggle_request'; }
    static get EVENT_STATUS_REPORT() { return 'status_report'; }

    static get COMMAND_SYNC_TIME() { return 'sync_time'; }
    static get COMMAND_REQUEST_SYNC_TIME() { return 'req_sync_time'; }
    static get COMMAND_SYNC_TIME() { return 'sync_time'; }
    static get COMMAND_SET_STATUS() { return 'set_status'; }
    static get COMMAND_REPORT_STATUS() { return 'report_status'; }
    static get COMMAND_TOGGLE_REQUEST() { return 'toggle_request'; }

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
        log.debug(`Message received: ${message.toString()}`);
        const { deviceId, command } = message;
        if (this.commandParserMap.has(command)) {
            this.commandParserMap.get(command)(message);
        } else {
            log.error(`Unknown commad received! (message contents: ${message.toString()})`);
        }
    }

    onSyncTimeRequest(message) {
        const { deviceId, payload } = message;
        this.emit(MessageInteractor.EVENT_SYNC_TIME_REQUEST, deviceId, payload);
    }

    onToggleRequest(message) {
        const { deviceId, payload } = message;
        this.emit(MessageInteractor.EVENT_TOGGLE_REQUEST, deviceId, payload);
    }

    onToggleRequest(message) {
        const { deviceId, payload } = message;
        this.emit(MessageInteractor.EVENT_TOGGLE_REQUEST, deviceId, payload);
    }

    onStatusReport(message) {
        const { deviceId, payload } = message;
        this.emit(MessageInteractor.EVENT_STATUS_REPORT, deviceId, payload);
    }

    send(message) {
        return this.mqttManager.publish(...message.toMQTTmessage(MessageInteractor.TOPIC_CONTROL));
    }

    sendTimeSync(deviceId, timestamp) {
        return this.send(new Message(deviceId, MessageInteractor.COMMAND_SYNC_TIME, {}, timestamp));
    }

    sendState(deviceId, slotId, state, timestamp) {
        return this.send(new Message(deviceId, MessageInteractor.COMMAND_SET_STATUS, { slotId, state }, timestamp));
    }
}
module.exports = MessageInteractor;