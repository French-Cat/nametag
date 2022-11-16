const { EventEmitter } = require("events");
const { WebSocket } = require("ws");
const fetchUser = require("./fetch");
const { token, activity, users } = require("../settings/config").config[0];
payload = {
  op: 2,
  d: {
    token: token,
    intents: 4867,
    properties: {
      $os: "nametag",
      $browser: "Discord iOS",
      $device: "Discord iOS",
    },
    compress: false,
    presence: {
      activities: [
        {
          name: activity,
          type: 1,
        },
      ],
      large_threshold: 250,
      status: "online",
      afk: false,
    },
  },
};
class DiscordGateway extends EventEmitter {
  constructor() {
    super();
    this.ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
    this.ws.addEventListener("open", () => {
      this.ws.send(JSON.stringify(payload));
      this.emit("Websocket Open");
    });
    this.ws.addEventListener("message", (res) => {
      try {
        this.message(JSON.parse(res.data));
      } catch (error) { }
    });
    this.ws.addEventListener("close", (e) => {
      clearInterval(this.heartbeart);
    });
  }
  send(op, d) {
    if (this.ws.readyState !== this.ws.OPEN) return;
    return this.ws.send(JSON.stringify({ op, d }));
  }

  sendHeartbeat() {
    return this.ws.send(JSON.stringify({ op: 1, d: null }));
  }
  async message(data) {
    const { t, event, op, d } = data;
    switch (op) {
      case 10:
        const { heartbeat_interval } = d;
        this.heartbeart = setInterval(() => {
          this.sendHeartbeat();
        }, heartbeat_interval);
        break;
    }
    switch (t) {
      case "READY":
      case "PRESENCE_UPDATE":
        if (d.user.id == users) {
          d.user = await fetchUser(users)
          delete d.status
          return this.emit("lanyard", d);
        }
    }
  }
}
module.exports = DiscordGateway;