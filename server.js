const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MERCHANT_ID = "682c6381dfc9ac0473670ecb";
const KEY = "iw9?YRYgtNC?A2f#3gFC4zYa6fn6#2MHC1Bj"; // тестовый ключ

app.post("/payme", async (req, res) => {
  const { name, phone } = req.body;
  const orderId = "order_" + Date.now();

  try {
    const response = await axios.post(
      "https://checkout.test.paycom.uz/api",
      {
        jsonrpc: "2.0",
        method: "CreateInvoice",
        params: {
          amount: 990000,
          account: {
            order_id: orderId,
            phone,
            name,
          },
          merchant: MERCHANT_ID,
        },
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from("Paycom:" + KEY).toString("base64"),
          "Content-Type": "application/json",
        },
      }
    );

    const invoiceUrl = response.data.result?.invoice_url;
    if (!invoiceUrl) {
      console.error("Invoice URL not found:", response.data);
      return res.status(500).json({ error: "No invoice URL from Payme" });
    }

    return res.json({ url: invoiceUrl });
  } catch (err) {
    console.error("Payme error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Payme request failed" });
  }
});

app.post("/payme/callback", (req, res) => {
  console.log("Callback received:", req.body);
  res.send({ result: "ok" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
