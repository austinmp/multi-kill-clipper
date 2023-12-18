class EventService {
  subscribers: any;

  constructor() {
    this.subscribers = {};
  }

  subscribe(eventName: any, fn: any) {
    this.subscribers[eventName] = this.subscribers[eventName] || [];
    this.subscribers[eventName].push(fn);
  }

  publish(eventName: any, data: any) {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName].forEach(function (fn: any) {
        fn(data);
      });
    }
  }

  unsubscribe(eventName: any, fn: any) {
    if (this.subscribers[eventName]) {
      for (let i = 0; i < this.subscribers[eventName].length; i++) {
        if (this.subscribers[eventName][i] === fn) {
          this.subscribers[eventName].splice(i, 1);
          break;
        }
      }
    }
  }
}

export default new EventService();
