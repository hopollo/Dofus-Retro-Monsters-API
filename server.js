require("dotenv").config();
const express = require("express");
const app = express();
const { readFile, writeFile } = require("fs");
const fetch = require("node-fetch");

const PORT = process.env.PORT || 8080;

const filePath = "./monsters.json";

let updating = false;

app.use(express.static("public"));

app.get("/v1/id/:id", (req, res) => {
  const id = req.params.id;

  readFile(filePath, (err, data) => {
    if (err) throw new Error(err);

    const json = JSON.parse(data);
    res.status(200).json({ id, name: json[id] });
  });
});

app.get("/v1/name/:name", (req, res) => {
  const name = req.params.name
    .toLowerCase()
    .split(" ")
    .join(" ");
  
  readFile(filePath, (err, data) => {
    if (err) return console.error(err);

    const json = JSON.parse(data);

    for (const mob in json) {
      if (json[mob].toLowerCase() == name) {
        res.status(200).json({ id: mob, name: json[mob] });
      }
    }
  });
});

app.get("/v1/monsters", (req, res) => {
  readFile(filePath, "utf-8", (err, data) => {
    if (err) return res.status(500);
    res.status(200).json(JSON.parse(data));
  });
});

app.get("/v1/update/:code", async (req, res) => {
  const code = req.params.code;

  if (code !== process.env.CODE) return console.error("Access Denied.");

  if (updating)
    return (
      console.log("Update in progress, try later..."),
      res.json({ message: "Update in progress, try later..." })
    );

  console.log("Fetching & Updating the DB...");

  updating = true;

  for (let i = 0, len = 10000; i < len; i++) {
    console.log(`${i}/${len} | (${Math.round((i/len)*100)}%)`);
    try {
      // Getting all good ids from Ankama DB
      const foundID = await fetch(
        `https://static.ankama.com/dofus/www/game/monsters/200/${i}.png`
      );
      if (foundID.status !== 200) continue;

      // Getting matching names from Solomonk DB
      const options = {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      };

      const mobData = await fetch(
        `https://hopollocors.herokuapp.com/https://solomonk.fr/ajax/select_monster.php?lang=fr&Q=10&O=0&T=all&I=${i}&CS%5BbestiaryCollapseSpells%5D=true&CS%5BbestiaryCollapseSubareas%5D=true&CS%5BbestiaryCollapseDrops%5D=true&CS%5BbestiaryCollapseDropsTemporis%5D=true`,
        options
      ).then((res) => res.json());
      if (mobData.status !== 200) continue;

      const name = JSON.stringify(mobData.html)
        .split("text-sololightbeige")[1]
        .split(">")[1]
        .split("<")[0];

      console.log(name);

      readFile(filePath, "utf-8", (err, data) => {
        if (err) return console.error(err);

        const json = JSON.parse(data);
        json[i] = name;

        writeFile(filePath, JSON.stringify(json), (err) => {
          if (err) return console.error(err);
        });
      });
    } catch (e) {
      console.log("@update", e);
    }

    updating = false;
  }
});

app.get("/", (req, res) => {
  res.send("index.html");
});

app.listen(PORT, () => console.log(`Running : http://localhost:${PORT}/`));
