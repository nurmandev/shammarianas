const verifyEmail = (username, verificationToken) => {
  return {
    body: {
      name: username,
      logo: "https://mailgen.js/img/logo.png",
      link: "https://mailgen.js/",
      intro: `Email Confirmation`,
      action: {
        instructions: "To verify your email address, please click here",
        button: {
          color: "#5a2ce2",
          text: "Verify",
          link: `${process.env.CLIENT_URL}/email-verification?token=${verificationToken}`,
        },
      },
      outro: "This email is automatically generated. Please do not answer it.",
    },
  };
};

const resetPassword = (username, verificationToken) => {
  return {
    body: {
      name: username,
      logo: "https://mailgen.js/img/logo.png",
      link: "https://mailgen.js/",
      intro: `Password Reset`,
      action: {
        instructions: "To reset your password, please click here",
        button: {
          color: "#5a2ce2",
          text: "Reset password",
          link: `${process.env.CLIENT_URL}/reset-password?token=${verificationToken}`,
        },
      },
      outro: "This email is automatically generated. Please do not answer it.",
    },
  };
};

const userCredentials = (
  username,
  role,
  email,
  password,
  verificationToken
) => {
  return {
    body: {
      name: username,
      logo: "https://mailgen.js/img/logo.png",
      link: "https://mailgen.js/",
      intro: `You are now a Shammarians website ${
        role === "admin" ? "admin" : "manager"
      }`,
      table: {
        data: [
          {
            Email: email,
            Password: password,
          },
        ],
      },
      action: {
        instructions: "To update your credentials, please click here",
        button: {
          color: "#5a2ce2",
          text: "Update your credentials",
          // link: `${process.env.DEPLOYMENT_CLIENT_URI}/dashboard/account`
          link: `${process.env.CLIENT_URL}/users/reset-password?token=${verificationToken}`,
        },
      },
      outro: "This email is automatically generated. Please do not answer it.",
    },
  };
};

module.exports = { verifyEmail, resetPassword, userCredentials };
