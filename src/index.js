const MessageInteractor = require('./interactor/messageIntractor');
const { mqttManager, messageInteractor, deviceInteractor } = require('./bootstrap');

const main = () => {
    console.log('Starting Aquaman server');
    messageInteractor.init();
}

main();

