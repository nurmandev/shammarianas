const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
// const Stripe = require("stripe");
// const {google} = require("googleapis");

// Add CORS configuration
exports.createOrder = onCall({
  cors: true,
}, async (data, context) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  try {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new HttpsError(
          "unauthenticated",
          "User must be logged in.",
      );
    }

    const {amount} = data;

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


// Email configuration using environment variables for security
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Project owner's email from environment variable
const projectOwnerEmail = process.env.PROJECT_OWNER_EMAIL;

// Firestore trigger function
exports.notifyProjectOwner = functions.firestore
    .document("Support/{messageId}")
    .onCreate(async (snap, context) => {
      const messageData = snap.data();

      // Construct email content
      const mailOptions = {
        from: "your-email@gmail.com",
        to: projectOwnerEmail,
        subject: `New Support Message: ${messageData.subject}`,
        text: `You have received a new support message.\n\nFrom:
         ${messageData.email}\nSubject: 
         ${messageData.subject}\nMessage:
        ${messageData.body}\n\nCheck your admin panel for details.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent to project owner.");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });


// exports.checkUserRole = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError(
// "unauthenticated", "User must be authenticated.");
//   }

//   try {
//     const projectId = "your-project-id";
//     const email = context.auth.token.email;

//     const auth = new google.auth.GoogleAuth({
//       scopes: ["https://www.googleapis.com/auth/cloud-platform"],
//     });

//     const cloudResourceManager = google.cloudresourcemanager({
//       version: "v1",
//       auth: await auth.getClient(),
//     });

//     const iamPolicy = await cloudResourceManager.projects.getIamPolicy({
//       resource: projectId,
//       requestBody: {}, // Required to avoid errors
//     });

//     const isAdmin = iamPolicy.data.bindings?.some((binding) =>
//       binding.role.includes("roles/owner")
// && binding.members.includes(`user:${email}`)
//     );

//     return { isAdmin: !!isAdmin };
//   } catch (error) {
//     console.error("Error checking user role:", error);
//     throw new functions.https.HttpsError("internal",
// "Error checking user role.");
//   }
// });
