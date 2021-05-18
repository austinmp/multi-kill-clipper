class EventService{

    constructor(){
        this.subcribers = {};
    }

    subscribe(eventName, fn) {
        this.subcribers[eventName] = this.subcribers[eventName] || [];
        this.subcribers[eventName].push(fn);
    }

    publish(eventName, data) {
        if (this.subcribers[eventName]) {
            this.subcribers[eventName].forEach(function(fn) {
                fn(data);
            });
        }
    }

    unsubscribe(eventName, fn) {
        if (this.subcribers[eventName]) {
            for (var i = 0; i < this.subcribers[eventName].length; i++) {
                if (this.subcribers[eventName][i] === fn) {
                    this.subcribers[eventName].splice(i, 1);
                    break;
                }
            };
        }
    }
}

module.exports = new EventService();
