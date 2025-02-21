const nodemailer = require('nodemailer')
const promise = require('promise')
var opts = require('./otp')
const mailtemplate = require('./mail-template')
require('dotenv').config();



const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

module.exports = {
    mail_sender_api_Call: (email) => {
        return new promise(async (resolve, reject) => {
            const otp = await opts.otp_generation_for_User_Authentication();
            const mailOption = {
                from: process.env.SENDER_EMAIL, // sender address
                to: email, // list of receivers
                subject: "Hello Welcomt to MERN Authentiction", // Subject line
                // text: "MERN Email Authentication confirm", // plain text body
                html:mailtemplate.EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp)
            };

            await transporter.sendMail(mailOption);
            resolve(otp)

        })
    }

}

