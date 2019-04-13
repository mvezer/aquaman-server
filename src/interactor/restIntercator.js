const restify = require('restify');
const log = require('../infrastructure/logger')('RestInteractor');

class RestInteractor {
    constructor(schedulerInteractor, deviceInteractor) {
        this.schedulerInteractor = schedulerInteractor;
        this.deviceInteractor = deviceInteractor;
        this.server = restify.createServer();
    }

    initRouting() {
        this.server.put('/scheduler/reload', async (req, res, next) => {
            try {
                await this.schedulerInteractor.loadConfig();
                this.deviceInteractor.getRegisteredDevices()
                    .forEach(async (deviceId) => { this.schedulerInteractor.startDevice(deviceId); }, this);
            } catch (error) {
                res.send(500, `ERROR: ${error.message}`);
                return next();
            }

            res.send(200, 'OK');
        });

        this.server.put('/mode/:deviceId/:modeId', async (req, res, next) => {
            const { modeId, deviceId } = req.params;
            let response = null;
            try {
                response = await this.schedulerInteractor.toggleMode(deviceId, modeId);
                
            } catch (error) {
                res.send(500, { status: 'ERROR', data: error.message});
                console.error(error);
                return next();
            }

            res.send(200, { status: 'OK', data: response });
        });

        this.server.get('/status', (req, res, next) => {
            const data = [];
            this.deviceInteractor.devices.forEach((device, deviceId) => {
                const slots = {};
                device.slots.forEach((slotData, slotId) => { slots[slotId] = slotData });
                data.push({ deviceId, slots });
            });

            res.send(200, { status: 'OK', data });
        });
    }

    init() {
        this.initRouting();
        this.server.listen(process.env.REST_PORT || 3000, () => log.info(`${this.server.name} is listening at ${this.server.url}`));
    }
}

module.exports = RestInteractor;
