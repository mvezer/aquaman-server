class Device {
    static get STATUS_ON() { return 'on'; }
    static get STATUS_OFF() { return 'off'; }

    constructor(id, slots) {
        this.id = null;
        this.slots = new Map();
        slots.forEach(slotId => this.slots.set(slotId, { state: Device.STATUS_OFF, isLocked: false }));
    }

    lockSlot(slotId) {
        if (this.slots.has(slotId)) {
            this.slots.get(slotId).isLocked = true;
        } else {
            throw new Error(`Unknown slotId: ${slotId}`);
        }
    }

    unlockSlot(slotId) {
        if (this.slots.has(slotId)) {
            this.slots.get(slotId).isLocked = false;
        } else {
            throw new Error(`Unknown slotId: ${slotId}`);
        }
    }

    update(states) {
        Object.keys(states).forEach((slotId) => {
            if (this.slots.has(slotId)) {
                if (!this.slots.get(slotId).isLocked) {
                    this.slots.get(slotId).state = states[slotId];
                }
            } else {
                throw new Error(`Unknown slotId: ${slotId}`);
            }
        });
    }
}

module.exports = Device;
