const bodyParser = require("body-parser");
const express = require("express");
const stripe = require("stripe")("sk_test_qzoNcAG1y6ihyCZq0V7ZXkyC");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { amount, source } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount,
      currency: "cad",
      source
    });

    res.status(200).json(charge);
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
