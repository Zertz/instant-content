const randomCatUrl = (() => {
  const baseUrl = "https://thecatapi.com/api";

  const queryParams = {
    api_key: "MjczNDYx",
    format: "xml",
    type: "jpg"
  };

  const queryString = Object.entries(queryParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return `${baseUrl}/images/get?${queryString}`;
})();

function wait(ms = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        return reject(new Error("😿"));
      }

      resolve();
    }, ms);
  });
}

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

async function charge({ amount, source } = {}) {
  if (!amount || amount < 10) {
    throw new Error("amount must be specified");
  }

  if (amount < 1000) {
    throw new Error(`je vaux plus que $${amount / 100} 😾`);
  }

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
      amount,
      source
    })
  });

  const response = await fetch(request);

  return response.json();
}

(async () => {
  try {
    await wait();
  } catch (err) {
    alert(err.message);
  } finally {
    const response = await fetch(randomCatUrl);
    const xml = await response.text();
    const src = xml.match(new RegExp(/<url>(.+)<\/url>/))[1];
    const img = document.querySelector("img");
    const div = document.querySelector(".payment");

    img.src = src;

    div.classList.remove("hidden");

    try {
      const Stripe = await injectScript("https://js.stripe.com/v3/");
      const stripe = Stripe("pk_test_1GpNlvEmyRojECrWYFhcKF8K");
      const elements = stripe.elements();

      const card = elements.create("card", {
        hidePostalCode: true
      });

      card.mount("#card-element");

      const form = document.getElementById("payment-form");

      const submitHandler = async event => {
        event.preventDefault();

        const { token } = await stripe.createToken(card);

        if (token) {
          try {
            const { value } = document.querySelector("input[type=number]");

            const json = await charge({
              amount: Number(value) * 100,
              source: token.id
            });

            alert(`Merci ${Math.round(json.amount / 100)} fois!`);

            window.location.reload();
          } catch (err) {
            alert(err.message);
          }
        }
      };

      form.addEventListener("submit", submitHandler);
    } catch (err) {
      console.error(err);
    }
  }
})();
