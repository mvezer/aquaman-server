const Device = require('../entities/device');
const Message = require('../entities/message');
const MessageInteractor = require('./messageIntractor');
const moment = require('moment');
const log = require('../infrastructure/logger')('DeviceInteractor');

class DeviceInteractor {
    static get COMMAND_SYNC_TIME() { return 'sync_time'; }
    static get COMMAND_REQUEST_SYNC_TIME() { return 'req_sync_time'; }
    static get COMMAND_SYNC_TIME() { return 'sync_time'; }
    static get COMMAND_SET_STATUS() { return 'set_status'; }
    static get COMMAND_REPORT_STATUS() { return 'report_status'; }
    static get COMMAND_TOGGLE_REQUEST() { return 'toggle_request'; }

    constructor(messageInteractor) {
        this.devices = new Map();
        this.commandParserMap = new Map();
        this.commandParserMap.set(DeviceInteractor.COMMAND_REQUEST_SYNC_TIME, this.onSyncTimeRequest.bind(this));
        this.commandParserMap.set(DeviceInteractor.COMMAND_TOGGLE_REQUEST, this.onToggleRequest.bind(this));
        this.commandParserMap.set(DeviceInteractor.COMMAND_REPORT_STATUS, this.onStatusReport.bind(this));
        this.messageInteractor = messageInteractor;
        this.messageInteractor.on(MessageInteractor.EVENT_MESSAGE, this.onMessage.bind(this));
    }

    registerDevice(id, slots) {
        this.devices.set(id, new Device(id, slots));
    }

    onMessage(message) {
        const { deviceId, command } = message;
        if (this.commandParserMap.has(command)) {
            this.commandParserMap.get(command)(message);
        } else {
            log.error(`Unknown commad received! (message contents: ${message.toString()})`);
        }
    }

    async onSyncTimeRequest(message) {
        const { deviceId, payload } = message;
        if (!this.deviceId.has(deviceId)) {
            this.registerDevice(deviceId, payload);
        }
        const timestamp = moment().unix();
        await this.messageInteractor.send(new Message(deviceId, DeviceInteractor.COMMAND_SYNC_TIME, {}, timestamp));
    }

    onToggleRequest(message) {

    }

    onStatusReport(message) {

    }

}

module.exports = DeviceInteractor;
