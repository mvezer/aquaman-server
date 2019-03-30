const MQTTmanager = require('./infrastructure/mqttManager');
const MessageInteractor = require('./interactor/messageIntractor');
const DeviceInteractor = require('./interactor/deviceInteractor');

const mqttManager = new MQTTmanager({ ip: process.env.MOSQUITTO_IP, port: process.env.MOSQUITTO_PORT });
const messageInteractor = new MessageInteractor(mqttManager);
const deviceInteractor = new DeviceInteractor(messageInteractor);

module.exports = {
    MessageInteractor,
    mqttManager,
    messageInteractor,
    deviceInteractor
}