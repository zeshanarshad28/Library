const nodemailer = require("nodemailer");
const pug = require("pug");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Zeeshan Arshad <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Send Grid
      return nodemailer.createTransport({
        service: "SendGrid",
        // service: "gmail",
        auth: {
          // user: process.env.SENDGRID_USERNAME,
          // user: "zeshanarshad28@gmail.com",
          user: "apikey",
          // pass: process.env.SENDGRID_PASSWORD,
          pass: "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",
        },
      });
    }
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // console.log(this.from);
    // console.log(this.to);
    // console.log(process.env.EMAIL_USERNAME);
    // console.log(process.env.EMAIL_PASSWORD);

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: "Thanks!",
    };
    // 3)Creat a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("Welcome", "Welcome to Magnus Mage");
  }
  async sendPasswordReset() {
    await this.send(
      "Password Reset",
      "Your password reset token ! ( valid for 10 minutes)"
    );
  }
};
