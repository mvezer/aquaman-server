const DeviceInteractor = require('./deviceInteractor');
const log = require('../infrastructure/logger')('SchedulerInteractor');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const moment = require('moment');

const SECONDS_IN_DAY = 24 * 60 * 60;

class SchedulerInteractor {
    constructor(deviceInteractor) {
        this.deviceInteractor = deviceInteractor;
        this.configFile = process.env.SCHEDULER_CONFIG_FILE || 'schedules.json';
        this.schedules = {};
        this.modes = {};
    }

    async loadConfig() {
        let configJSON;
        try {
            configJSON = await readFile(this.configFile, 'utf8');
        } catch (error) {
            log.error(`Error reading config from file: ${this.configFile}`);
        }

        let configObj;
        try {
            configObj = JSON.parse(configJSON);
        } catch (error) {
            log.error(`Error parsing config JSON! (${error.message})`);
        }

        this.schedules = {};
        Object.keys(configObj.schedules).forEach((deviceId) => {
            this.schedules[deviceId] = {};
            Object.keys(configObj.schedules[deviceId]).forEach((slotId) => {
                this.schedules[deviceId][slotId] = {};
                this.schedules[deviceId][slotId]['timeoutId'] = null;
                this.schedules[deviceId][slotId]['schedules'] = configObj.schedules[deviceId][slotId]
                    .map((item) => {
                        return {
                            timestamp: (moment(item.time, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds')),
                            state: item.state
                        }
                    })
                    .sort((item1, item2) => { return item1.timestamp - item2.timestamp });
            }, this);
        }, this);

        Object.keys(configObj.modes).forEach((modeId) => {
            this.modes[modeId] = {};
            this.modes[modeId]['slotStates'] = {};
            this.modes[modeId]['timeout'] = (moment(configObj.modes[modeId]['timeout'], 'HH:mm:ss').diff(moment().startOf('day'), 'seconds')),
            Object.keys(configObj.modes[modeId]['slotStates']).forEach(slotId => this.modes[modeId]['slotStates'][slotId] = configObj.modes[modeId]['slotStates'][slotId]);
        }, this);

        log.info(`config '${this.configFile}' loaded and parsed`);
    }

    getNextSchedulingEvent(deviceId, slotId, now) {
        const currentTimestamp = (now || moment()).diff(moment().startOf('day'), 'seconds');
        const schedules = this.schedules[deviceId][slotId]['schedules'];
        let foundBigger = false;
        let i = 0;
        while (i < schedules.length && !foundBigger) {
            foundBigger = currentTimestamp < schedules[i].timestamp;
            i++;
        }

        console.log(deviceId, slotId, foundBigger, schedules);

        if (foundBigger) {
            return {
                timeoutSecs: schedules[i - 1].timestamp - currentTimestamp,
                state: schedules[i - 1].state
            }
        } else {
            return {
                timeoutSecs: SECONDS_IN_DAY - currentTimestamp + schedules[0].timestamp,
                state: schedules[0].state
            }
        }
    }

    scheduleNext(deviceId, slotId, now) {
        if (this.schedules[deviceId][slotId]['timeoutId'] !== null) {
            clearTimeout(this.schedules[deviceId][slotId]['timeoutId']);
            this.schedules[deviceId][slotId]['timeoutId'] = null;
        }
        const { timeoutSecs, state } = this.getNextSchedulingEvent(deviceId, slotId, now);
        this.schedules[deviceId][slotId]['timeoutId'] = setTimeout(this.onTimeout.bind(this), timeoutSecs * 1000, deviceId, slotId, state);
    }

    getCurrentState(deviceId, slotId, now) {
        const currentTimestamp = (now || moment()).diff(moment().startOf('day'), 'seconds');
        let schedules = [{ timestamp: currentTimestamp, state: 'x' }];
        schedules = schedules.concat(this.schedules[deviceId][slotId]['schedules'].map(i => i));
        schedules.sort((a, b) => { return a.timestamp - b.timestamp });
        const i = schedules.findIndex(s => s.state === 'x');
        return i === 0 ? schedules[schedules.length - 1].state : schedules[i - 1].state;
    }

    async startDevice(deviceId) {
        if (!this.schedules.hasOwnProperty(deviceId)) {
            log.warn(`Cannot start schedule for device '${deviceId}', that has no schedule`);
            return;
        }

        const now = moment();

        Object.keys(this.schedules[deviceId]).forEach(async (slotId) => {
            this.scheduleNext(deviceId, slotId);
            await this.deviceInteractor.setState(deviceId, slotId, this.getCurrentState(deviceId, slotId));
        }, this);

        log.info(`device (${deviceId}) has been started!`);
    }

    async onTimeout(deviceId, slotId, state) {
        await this.deviceInteractor.setState(deviceId, slotId, state);
        this.scheduleNext(deviceId, slotId);
    }
}

module.exports = SchedulerInteractor;
