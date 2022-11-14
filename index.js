const { ports: { http } } = require("./settings/config").config[0]
const DiscordGateway = require("./core/gateway");
const Lanyard = new DiscordGateway();
const JSONdb = require('simple-json-db');
const db = new JSONdb('settings/db.json', { "jsonSpaces": 0 });
const app = require('express')();
var expressWs = require('express-ws')(app);

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

app.ws('/ws', function (ws, req) {
    ws.on('message', function (msg) {
        if (msg == "[object Object]") return ws.send(JSON.stringify({ ok: false}))
        msg = JSON.parse(msg)
        if (!db.has(msg.id)) return ws.send(JSON.stringify({ ok: false}))
        ws.send(JSON.stringify(Object.assign({ ok: true}, db.get(msg.id))))
    });
    ws.send({ ok: true})
});

app.listen(http, () => {
    console.log('server started');
});