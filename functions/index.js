// const { onCall } = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
// const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//   key_id: "your-key-id-here",
//   key_secret: "your-key-secret-here",
// });

// exports.createOrder = onCall(async (data, context) => {
//   try {
//     const options = {
//       amount: data.amount, // amount in the smallest currency unit
//       currency: "INR",
//       receipt: "receipt#1",
//     };
//     const order = await razorpay.orders.create(options);
//     return {
//       id: order.id,
//       currency: order.currency,
//       amount: order.amount,
//     };
//   } catch (error) {
//     logger.error("Error creating order", error);
//     throw new functions.https.HttpsError("internal", "Unable to create order");
//   }
// });


const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const Stripe = require("stripe");
const { google } = require("googleapis");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

exports.createOrder = onCall(async (data, context) => {
  try {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be logged in."
      );
    }

    const { amount } = data; 

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: "inr",
      metadata: {
        userId: context.auth.uid, 
      },
    });

    // Return the client secret to the client
    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    logger.error("Error creating Payment Intent:", error);
    throw new HttpsError("internal", "Unable to create order");
  }
});


exports.checkUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  try {
    const projectId = "your-project-id";
    const email = context.auth.token.email;

    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const cloudResourceManager = google.cloudresourcemanager({
      version: "v1",
      auth: await auth.getClient(),
    });

    const iamPolicy = await cloudResourceManager.projects.getIamPolicy({
      resource: projectId,
      requestBody: {}, // Required to avoid errors
    });

    const isAdmin = iamPolicy.data.bindings?.some((binding) =>
      binding.role.includes("roles/owner") && binding.members.includes(`user:${email}`)
    );

    return { isAdmin: !!isAdmin };
  } catch (error) {
    console.error("Error checking user role:", error);
    throw new functions.https.HttpsError("internal", "Error checking user role.");
  }
});