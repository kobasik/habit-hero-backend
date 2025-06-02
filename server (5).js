
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const payme = require("./payme");

dotenv.config();
const app = express();
app.use(cors({
  origin: "https://habituz.tilda.ws"
}));
app.use(bodyParser.json());

app.post("/payme/create", async (req, res) => {
  try {
    const { name, phone } = req.body;
    const response = await payme.fullFlow({ name, phone });
    res.json(response);
  } catch (err) {
    console.error("Ошибка в /payme/create:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/payme/callback", (req, res) => {
  console.log("Payme callback received:", req.body);
  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server is running on port", PORT);
});
