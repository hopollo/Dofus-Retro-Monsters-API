require('dotenv').config();
const app = require("express")();
const { readFile, writeFile } = require("fs");
const fetch = require("node-fetch");

const PORT = process.env.PORT || 8080;
const filePath = "./monsters.json";

let updating = false;

app.get("/v1/id/:id", (req, res) => {
  const id = req.params.id;

  readFile(filePath, (err, data) => {
    if (err) throw new Error(err);

    const json = JSON.parse(data);
    res.status(200).json({ id, name: json[id] });
  });
});

app.get("/v1/name/:name", (req, res) => {
  const name = req.params.name;

  readFile(filePath, (err, data) => {
    if (err) return console.error(err);

    const json = JSON.parse(data);

    for (const mob in json) {
      if (json[mob] == name) {
        res.status(200).json({ id: mob, name: json[mob] });
      }
    }
  });
});

app.get("/v1/monsters", (req, res) => {
  readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500);
    res.status(200).json(JSON.parse(data));
  });
});

app.get("/v1/update/:code", async (req, res) => {
  const code = req.params.code;

  if (code !== process.env.CODE) return console.error('Access Denied.');

  if (updating)
    return (
      console.log("Update in progress, try later..."),
      res.json({ message: "Update in progress, try later..." })
    );

  console.log("Fetching & Updating the DB...");

  updating = true;

  for (let i = 0, len = 10000; i < len; i++) {
    console.log(`${i}/${len}`);
    // Getting all good ids from Ankama DB
    const foundID = await fetch( `https://static.ankama.com/dofus/www/game/monsters/200/${i}.png`);
    if (foundID.status !== 200) continue;

    // Getting matching names from Solomonk DB
    const data = await fetch(`https://solomonk.fr/fr/monstre/${i}`).then((res) => res.text());

    const name = data
      .split("text-sololightbeige")[1]
      .split(">")[1]
      .split("<")[0];

    readFile(filePath, "utf-8", (err, data) => {
      if (err) return console.error(err);

      const json = JSON.parse(data);
      json[i] = name;

      writeFile(filePath, JSON.stringify(json), (err) => {
        if (err) return console.error(err);
      });
    });

    updating = false;
  }
});

app.get("/", (req, res) => {
  const html = `
    <h1>Bienvenue sur l'api Bestiaire Dofus Retro by <a href="https://hopollo.netlify.app">@HoPolloTV</a></h1>
    <h3>Utilisation : </h3>
    <h4>/v1/id/:id - Gets monster by ID</h4>
    <h4>/v1/name/:name - Gets monster by Name</h4>
    <h4>/v1/monsters - Gets all monsters as JSON </h4>
    <h5>json response of your search will be sent back to you, GLHF</h5>
    `;
  res.send(html);
});

app.listen(PORT, () => console.log(`Running : http://localhost:${PORT}/`));
