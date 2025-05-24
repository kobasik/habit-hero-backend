const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MERCHANT_ID = "682c6381dfc9ac0473670ecb";
const KEY = "iw9?YRYgtNC?A2f#3gFC4zYa6fn6#2MHC1Bj"; // test password

app.post("/payme/create", async (req, res) => {
    const { name, phone } = req.body;

    try {
        const response = await axios.post(
            "https://test.paycom.uz",
            {
                jsonrpc: "2.0",
                method: "CreateInvoice",
                params: {
                    amount: 990000, // 9900 * 100
                    account: { phone, name },
                    merchant: MERCHANT_ID
                },
                id: 1
            },
            {
                headers: {
                    Authorization: "Basic " + Buffer.from(MERCHANT_ID + ":" + KEY).toString("base64"),
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({ url: response.data?.result?.invoice_url || "", full: response.data });
    } catch (e) {
        return res.status(500).json({ error: "Payme request failed", details: e?.response?.data || e.message });
    }
});

app.post("/payme/callback", (req, res) => {
    console.log("Callback received:", req.body);
    res.send({ result: "ok" });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
