const EventEmitter = require('events');
const Device = require('../entities/device');
const Message = require('../entities/message');
const MessageInteractor = require('./messageIntractor');
const moment = require('moment');
const log = require('../infrastructure/logger')('DeviceInteractor');

class DeviceInteractor extends EventEmitter {
    static get EVENT_DEVICE_REGISTERED() { return 'device_registered'; }

    constructor(messageInteractor) {
        super();
        this.devices = new Map();
        
        this.messageInteractor = messageInteractor;
        this.messageInteractor.on(MessageInteractor.EVENT_SYNC_TIME_REQUEST, this.onSyncTimeRequest.bind(this));
        this.messageInteractor.on(MessageInteractor.EVENT_STATUS_REPORT, this.onStatusReport.bind(this));
    }

    registerDevice(id, slots) {
        this.devices.set(id, new Device(id, slots));
        this.emit(DeviceInteractor.EVENT_DEVICE_REGISTERED, id);
    }

    async onSyncTimeRequest(deviceId, slots) {
        if (!this.devices.has(deviceId)) {
            this.registerDevice(deviceId, slots);
        }
        await this.messageInteractor.sendTimeSync(deviceId, moment().unix());
    }

    async onStatusReport(deviceId, states) {
        if (!this.devices.has(deviceId)) {
            log.warn(`not registered device id received (${deviceId}), registering device...`);
            await this.messageInteractor.sendTimeSync(deviceId, moment().unix());
            this.registerDevice(deviceId, Object.keys(states));
        }
        try {
            this.devices.get(deviceId).update(states);
        } catch (error) {
            log.error(`error when updating device (${deviceId}): ${error.message}`);
        }
    }

    setState(deviceId, slotId, state) {
        return this.messageInteractor.sendState(deviceId, slotId, state, moment.unix());
    }

    async onToggleRequest(deviceId, togglestate) {
        if (!this.devices.has(deviceId)) {
            log.error(`cannot process toggle request, device is unregistered: ${deviceId}`);
        } else {
            Object.keys(togglestate).forEach(async (slotId) => { await this.messageInteractor.sendState(deviceId, slotId, state, moment().unix()); });
        }
    }
}

module.exports = DeviceInteractor;
