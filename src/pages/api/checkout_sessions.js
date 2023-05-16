const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            //preço de 5 reais pela conta do Marcelo: price_1N8RPNLhANYDuGlJ6rMal1bK
            //teste: price_1N5zpRHTvInZMjOgqOcPPpm8
            price: "price_1N8RPNLhANYDuGlJ6rMal1bK",
            quantity: 1,
          },
        ],
        mode: "payment",
        //success_url: `${req.headers.origin}/?success=true`,
        //Producao
        success_url: `https://historygen.vercel.app/dashboard/?success=true`,
        //cancel_url: `${req.headers.origin}/?canceled=true`,
        //producao
        cancel_url: `https://historygen.vercel.app/dashboard/?canceled=true`,

        //dev
        //success_url: `http://localhost:3000/dashboard/?success=true`,
        //cancel_url: `http://localhost:3000/dashboard/?canceled=true`,
      });
      res.redirect(303, session.url);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
