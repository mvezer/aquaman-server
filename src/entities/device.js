class Device {
    static get STATUS_ON() { return 'on'; }
    static get STATUS_OFF() { return 'off'; }

    constructor(id, slots) {
        this.id = null;
        this.slots = new Map();
        slots.forEach(slotId => this.slots.set(slotId, Device.STATUS_OFF));
    }

    update(states) {
        Object.keys(states).forEach((slotId) => {
            if (this.slots.has(slotId)) {
                this.slots.set(slotId, states[slotId]);
            } else {
                throw new Error(`Unknown slotId: ${slotId}`);
            }
        });
    }
}

module.exports = Device;
