class Device {
    static get STATUS_ON() { return 'on'; }
    static get STATUS_OFF() { return 'off'; }

    constructor(id, slots) {
        this.id = null;
        this.slots = new Map();
        slots.forEach(slotId => this.slots.set(slotId, Device.STATUS_OFF));
    }
}

module.exports = Device;
