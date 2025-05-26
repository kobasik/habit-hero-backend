const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MERCHANT_ID = "682c6381dfc9ac0473670ecb";
const KEY = "iw9?YRYgtNC?A2f#3gFC4zYa6fn6#2MHC1Bj"; // Тестовый ключ

app.post("/payme", async (req, res) => {
  const { name, phone } = req.body;

  try {
console.log('Запрос от клиента:', { name, phone });
    const response = await axios.post(
      "https://checkout.test.paycom.uz/api",
      {
        jsonrpc: "2.0",
        method: "CreateInvoice",
        params: {
          amount: 990000,
          account: {
            phone,
            name,
          },
          merchant: MERCHANT_ID,
        },
      },
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(MERCHANT_ID + ":" + KEY).toString("base64"),
          "Content-Type": "application/json",
        },
      }
    );

    const pay_url = response.data?.result?.receipt?.pay_url;
    if (pay_url) {
      res.json({ success: true, url: pay_url });
    } else {
      res.status(500).json({ success: false, error: "Payment link not found" });
    }
  } catch (error) {
    console.error("Payme error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Payme request failed",
      details: error?.response?.data,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
