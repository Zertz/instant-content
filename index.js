const bodyParser = require("body-parser");
const express = require("express");
const stripe = require("stripe")("sk_test_BQokikJOvBiI2HlWgH4olfQ2");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  try {
    const charge = await stripe.charges.create({
      amount: 999,
      currency: "cad",
      source: req.body.source
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
