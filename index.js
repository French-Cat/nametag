const DiscordGateway = require("./core/gateway");
const Lanyard = new DiscordGateway();
const JSONdb = require('simple-json-db');
const db = new JSONdb('settings/db.json', {"jsonSpaces":0});
const app = require('express')();

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

app.listen(3000, () => {
  console.log('server started');
});