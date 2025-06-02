
const axios = require("axios");

const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID;
const PAYME_LOGIN = process.env.PAYME_LOGIN;
const PAYME_PASSWORD = process.env.PAYME_PASSWORD;
const BASIC_AUTH = Buffer.from(PAYME_LOGIN + ":" + PAYME_PASSWORD).toString("base64");

async function createSubscription({ name, phone }) {
  const url = "https://checkout.test.paycom.uz/api";

  const requestData = {
    id: String(Date.now()),
    method: "cards.create",
    params: {
      card: {
        number: "",  // Клиент введёт на фронте
        expire: ""   // Клиент введёт на фронте
      },
      save: true
    }
  };

  const response = await axios.post(url, requestData, {
    headers: {
      "X-Auth": BASIC_AUTH,
      "Content-Type": "application/json"
    }
  });

  return response.data;
}

module.exports = { createSubscription };
