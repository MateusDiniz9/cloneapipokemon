import axios from "axios";
const url = "https://pokeapi.co/api/v2/";
import express from "express";
import { MongoClient } from "mongodb";

const server = express();
server.use(express.json());

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db("pokemart");
});

server.post("/products", async (req, res) => {
  let listaPokemon = [];
  try {
    const dados = await axios.get(`${url}/pokemon/?offset=0&limit=151`);
    const pokemons = dados.data.results;
    const urlPoke = pokemons.map((pokemon) => pokemon.url);
    urlPoke.forEach((url) => {
      let poke = axios.get(url).then((res) => {
        listaPokemon.push({
          id: res.data.id,
          name: res.data.name,
          img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${res.data.id}.png`,
          stats: res.data.stats.map(
            (stat) => `${stat.stat.name}, ${stat.base_stat}`
          ),
          type: res.data.types.map((type) => type.type.name),
        });
        db.collection("products").insertOne({
          id: res.data.id,
          name: res.data.name,
          img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${res.data.id}.png`,
          stats: res.data.stats.map(
            (stat) => `${stat.stat.name}, ${stat.base_stat}`
          ),
          type: res.data.types.map((type) => type.type.name),
          price: Math.floor(Math.random() * 10000) + 5000,
        });
      });
    });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
  }
});

server.listen(5000, () => console.log(`Server running in port: 5000`));
