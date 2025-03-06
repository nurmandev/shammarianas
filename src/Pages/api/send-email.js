import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing (needed for file uploads)
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "public/uploads");
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }

    const { subject, description, issueType } = fields;
    const file = files.file ? files.file[0] : null;

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "adebayour66265@gmail.com", // Use environment variables for security
          pass: "dlrtvouptlrtvvvr",
        },
      });

      const mailOptions = {
        from: "adebayour66265@gmail.com",
        to: "support@company.com",
        subject: `Support Request: ${issueType}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Issue Type:</strong> ${issueType}</p>
          <p><strong>Description:</strong> ${description}</p>
        `,
        attachments: file
          ? [
              {
                filename: file.originalFilename,
                path: file.filepath,
              },
            ]
          : [],
      };

      await transporter.sendMail(mailOptions);

      // Cleanup: Delete uploaded file after sending email
      if (file) {
        fs.unlinkSync(file.filepath);
      }

      return res
        .status(200)
        .json({ message: "Report submitted successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Failed to send email" });
    }
  });
}
