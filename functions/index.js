const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const Razorpay = require("razorpay");

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));

// 🔒 Load environment variables from Firebase Config
const key_id = process.env.RAZORPAY_KEY_ID || "your-key-id-here";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "your-key-secret-here";
const emailUser = process.env.EMAIL_USER || "adebayour66265@gmail.com";
const emailPass = process.env.EMAIL_PASS || "dlrtvouptlrtvvvr";

// ⚙️ Multer setup for handling file uploads
const upload = multer({ dest: "/tmp/" });

// ✉️ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// 📩 Support Email Handler
app.post("/sendSupportEmail", upload.single("file"), async (req, res) => {
  try {
    const { subject, description, issueType } = req.body;
    const file = req.file;

    const mailOptions = {
      from: emailUser,
      to: "support@company.com",
      subject: `Support Request: ${issueType}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Description:</strong> ${description}</p>
      `,
      attachments: file
        ? [{ filename: file.originalname, path: file.path }]
        : [],
    };

    await transporter.sendMail(mailOptions);

    // ✅ Cleanup: Delete uploaded file after sending email
    if (file) fs.unlinkSync(file.path);

    return res.status(200).json({ message: "Report submitted successfully!" });
  } catch (error) {
    logger.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
});

// 🔥 Deployable Firebase Function for Support Emails
exports.sendSupportEmail = functions.https.onRequest(app);

// 🏦 Razorpay Setup
const razorpay = new Razorpay({ key_id, key_secret });

// 💳 Razorpay Order Creation
exports.createOrder = onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated."
      );
    }

    if (!data.amount || typeof data.amount !== "number" || data.amount <= 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid amount."
      );
    }

    const receiptId = `receipt_${Date.now()}`;

    const options = {
      amount: data.amount,
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);

    logger.info("Order created successfully", { orderId: order.id });

    return {
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      receipt: receiptId,
    };
  } catch (error) {
    logger.error("Error creating order", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Unable to create order."
    );
  }
});
