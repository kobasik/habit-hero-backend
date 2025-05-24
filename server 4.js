
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

app.post("/payme/callback", (req, res) => {
  const { method, params, id } = req.body;

  console.log("Запрос от Payme:", req.body);

  if (method === "CheckPerformTransaction") {
    return res.json({
      jsonrpc: "2.0",
      result: {
        allow: true
      },
      id
    });
  }

  if (method === "CreateTransaction") {
    return res.json({
      jsonrpc: "2.0",
      result: {
        transaction: "some-unique-id",
        create_time: Date.now(),
        state: 1
      },
      id
    });
  }

  if (method === "PerformTransaction") {
    return res.json({
      jsonrpc: "2.0",
      result: {
        transaction: "some-unique-id",
        perform_time: Date.now(),
        state: 2
      },
      id
    });
  }

  if (method === "CancelTransaction") {
    return res.json({
      jsonrpc: "2.0",
      result: {
        transaction: "some-unique-id",
        cancel_time: Date.now(),
        state: -1,
        reason: 1
      },
      id
    });
  }

  return res.status(400).json({
    jsonrpc: "2.0",
    error: {
      code: -32601,
      message: "Method not found"
    },
    id
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
