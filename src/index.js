const DeviceInteractor = require('./interactor/deviceInteractor');
const { mqttManager, messageInteractor, deviceInteractor, schedulerInteractor } = require('./bootstrap');

const onDeviceRegistered = (deviceId) => {
    schedulerInteractor.startDevice(deviceId);
}

const main = async () => {
    console.log('Starting Aquaman server');
    messageInteractor.init();
    deviceInteractor.on(DeviceInteractor.EVENT_DEVICE_REGISTERED, onDeviceRegistered);
    await schedulerInteractor.loadConfig();
}

main();
