
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const payme = require("./payme");

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.post("/payme/create", async (req, res) => {
  try {
    const { name, phone } = req.body;
    const result = await payme.createSubscription({ name, phone });
    res.json(result);
  } catch (err) {
    console.error("Create error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/payme/callback", (req, res) => {
  console.log("Payme callback received:", req.body);
  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
