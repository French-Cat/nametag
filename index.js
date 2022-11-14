const { ports: { http, ws } } = require("./settings/config").config[0]
const DiscordGateway = require("./core/gateway");
const Lanyard = new DiscordGateway();
const JSONdb = require('simple-json-db');
const db = new JSONdb('settings/db.json', { "jsonSpaces": 0 });
const app = require('express')();
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: ws });

Lanyard.on("lanyard", upd);

function upd(data) {
    db.set(data.user.id, data)
}

app.get('/', (req, res) => {
    res.send(db.JSON())
});

app.get('/:id', (req, res) => {
    res.send(db.get(req.params.id))
});

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        if (!db.has(data.id)) return ws.send({ ok: false })
        ws.send(Object.assign({ ok: false }, db.get(data.id)));
    });

    ws.send({ ok: true });
});


app.listen(http, () => {
    console.log('server started');
});