require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
  },
});

const Url = mongoose.model("Url", urlSchema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", async function (req, res) {
  const url = req.body.url;
  if (!url) return res.json({ error: "please enter url" });

  let hostname;
  try {
    const parsedUrl = new URL(url);
    hostname = parsedUrl.hostname;
    console.log(hostname);
  } catch (err) {
    return res.status(400).json({ error: "invalid url1" });
  }
  dns.lookup(hostname, (err, address) => {
    if (err) return res.json({ error: "invalid url" });
  });
  const shortUrl = Math.floor(Math.random() * 100) + 1;

  try {
    const newUrl = new Url({ original_url: url, short_url: shortUrl });
    const saveUrl = await newUrl.save();
    return res.json({
      original_url: saveUrl.original_url,
      short_url: saveUrl.short_url,
    });
  } catch (error) {
    return console.error(error);
  }
});

app.get("/api/shorturl/:shorturl", async (req, res) => {
  const shortUrl = Number(req.params.shorturl);
  if (isNaN(shortUrl)) {
    return res.status(400).json({ error: "Invalid short URL" });
  }
  console.log(shortUrl);

  try {
    const findUrl = await Url.findOne({ short_url: shortUrl });
    if (findUrl) return res.redirect(findUrl.original_url);
    else return res.status(404).json({ error: "No short URL found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
