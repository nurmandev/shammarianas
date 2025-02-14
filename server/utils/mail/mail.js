const nodemailer = require("nodemailer");
const MailGen = require("mailgen");

const sendMail = async (email, messageTemplate) => {
  // Set transporter configuration
  const transporterConfig = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  };
  const transporter = nodemailer.createTransport(transporterConfig);

  // Create instance of MailGen
  const MailGenerator = new MailGen({
    theme: "default",
    product: {
      name: "Shammarianas",
      link: "https://mailgen.js/",
    },
  });

  // Generate the email
  const mail = MailGenerator.generate(messageTemplate);

  // Set mail config
  const mailConfig = {
    from: process.env.EMAIL,
    to: email,
    subject: "Shammarianas website",
    html: mail,
  };
  // Send the email
  await transporter.sendMail(mailConfig);
};

module.exports = { sendMail };
