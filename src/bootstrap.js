const MQTTmanager = require('./infrastructure/mqttManager');
const MessageInteractor = require('./interactor/messageIntractor');
const DeviceInteractor = require('./interactor/deviceInteractor');
const SchedulerInteractor = require('./interactor/schedulerInteractor');
const RestInteractor = require('./interactor/restIntercator');

const mqttManager = new MQTTmanager({ ip: process.env.MOSQUITTO_IP, port: process.env.MOSQUITTO_PORT });
const messageInteractor = new MessageInteractor(mqttManager);
const deviceInteractor = new DeviceInteractor(messageInteractor);
const schedulerInteractor = new SchedulerInteractor(deviceInteractor);
const restIntercator = new RestInteractor(schedulerInteractor, deviceInteractor);

module.exports = {
    MessageInteractor,
    mqttManager,
    messageInteractor,
    deviceInteractor,
    schedulerInteractor,
    restIntercator
}