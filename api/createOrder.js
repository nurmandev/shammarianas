import Stripe from 'stripe';
import Cors from 'cors';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize CORS middleware
const cors = Cors({
  origin: true, // Allow all origins
  methods: ['POST'], // Allow only POST requests
});

// Helper method to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
    console.log("running")
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Ensure the request method is POST
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  // Ensure the user is authenticated (you can use your own auth logic here)
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { amount } = req.body;

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'inr',
      metadata: {
        userId: 'user-id-from-auth', // Replace with actual user ID from your auth system
      },
    });

    // Return the client secret to the client
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    res.status(500).json({ message: 'Unable to create order' });
  }
}