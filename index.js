import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { default as mongodb, ServerApiVersion } from "mongodb";
import env from "dotenv";

let MongoClient = mongodb.MongoClient;

env.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const db = client.db("urlshortner");
const collection = db.collection("urldb");

async function getEndpoint() {
  const randomEndpoint = Math.random().toString(36).slice(2);
  const result = await collection.findOne({ endpoint: randomEndpoint });
  if (result) {
    return "" + getEndpoint();
  }
  return randomEndpoint;
}

app.get("/:endpoint", async (req, res) => {
  const endpoint = req.params.endpoint;
  const result = await collection.findOne({ endpoint: endpoint });
  if (result) {
    res.redirect(result.url);
  } else {
    res.send("URL Not Found");
  }
});

app.get("/get/endpoint", async (req, res) => {
  const url = req.query.url;
  const randomEndpoint = await getEndpoint();
  const result = await collection.findOne({ url: url });
  if (result) {
    res.send(`${process.env.MY_URL}${result.endpoint}`);
  }
  await collection.insertOne({
    url: url,
    endpoint: randomEndpoint,
  });
  res.send(`${process.env.MY_URL}${randomEndpoint}`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on 3000..");
});
