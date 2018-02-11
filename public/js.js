(async () => {
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = src;

      script.addEventListener("load", () => {
        return resolve(window.Stripe);
      });

      script.addEventListener("error", reject);
      script.addEventListener("abort", reject);

      document.head.appendChild(script);
    });
  }

  async function charge(source) {
    if (!source) {
      throw new Error("source must be specified");
    }

    const headers = new Headers({
      "Content-Type": "application/json"
    });

    const request = new Request("/", {
      method: "post",
      headers,
      body: JSON.stringify({
        source
      })
    });

    const response = await fetch(request);

    return response.json();
  }

  try {
    const Stripe = await injectScript("https://js.stripe.com/v3/");
    const stripe = Stripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");
    const elements = stripe.elements();

    const card = elements.create("card");

    card.mount("#card-element");

    const form = document.getElementById("payment-form");

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const { token } = await stripe.createToken(card);

      if (token) {
        try {
          const json = await charge(token.id);

          console.info(json);
        } catch (err) {
          console.error(err);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
})();
