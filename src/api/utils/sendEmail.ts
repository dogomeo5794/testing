import nodemailer from "nodemailer";
import fs from 'fs';
const { google } = require('googleapis');

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

async function getOAuth2Info(sender) {
   switch (sender) {
      case "registration":
         const REGISTRATION_AUTH = JSON.parse(process.env.REGISTRATION_AUTH);
         const oAuth2Registration = new google.auth.OAuth2(
            REGISTRATION_AUTH.CLIENT_ID,
            REGISTRATION_AUTH.CLIENT_SECRET,
            REDIRECT_URI
         );
         oAuth2Registration.setCredentials({ refresh_token: REGISTRATION_AUTH.REFRESH_TOKEN });
         return {
            email: `registration.tms@dict.gov.ph`,
            type: "Registration",
            clientId: REGISTRATION_AUTH.CLIENT_ID,
            clientSecret: REGISTRATION_AUTH.CLIENT_SECRET,
            refreshToken: REGISTRATION_AUTH.REFRESH_TOKEN,
            oAuth2: oAuth2Registration
         };
      case "transaction":
         const TRANSACTION_AUTH = JSON.parse(process.env.TRANSACTION_AUTH);
         const oAuth2Transaction = new google.auth.OAuth2(
            TRANSACTION_AUTH.CLIENT_ID,
            TRANSACTION_AUTH.CLIENT_SECRET,
            REDIRECT_URI
         );
         oAuth2Transaction.setCredentials({ refresh_token: TRANSACTION_AUTH.REFRESH_TOKEN });
         return {
            email: `transaction.tms@dict.gov.ph`,
            type: "Transaction",
            clientId: TRANSACTION_AUTH.CLIENT_ID,
            clientSecret: TRANSACTION_AUTH.CLIENT_SECRET,
            refreshToken: TRANSACTION_AUTH.REFRESH_TOKEN,
            oAuth2: oAuth2Transaction
         };
      case "helpdesk":
         const HELPDESK_AUTH = JSON.parse(process.env.HELPDESK_AUTH);
         const oAuth2Helpdesk = new google.auth.OAuth2(
            HELPDESK_AUTH.CLIENT_ID,
            HELPDESK_AUTH.CLIENT_SECRET,
            REDIRECT_URI
         );
         oAuth2Helpdesk.setCredentials({ refresh_token: HELPDESK_AUTH.REFRESH_TOKEN });
         return {
            email: `tms.helpdesk@dict.gov.ph`,
            type: "Helpdesk",
            clientId: HELPDESK_AUTH.CLIENT_ID,
            clientSecret: HELPDESK_AUTH.CLIENT_SECRET,
            refreshToken: HELPDESK_AUTH.REFRESH_TOKEN,
            oAuth2: oAuth2Helpdesk
         };
   };
};

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string[], sender: "registration" | "transaction" | "helpdesk", html: string, subject: string, filename?:string, content?:object ) {

   // create reusable transporter object using the default SMTP transport
   try {
      const oAuth2Info = await getOAuth2Info(sender);
      console.log(oAuth2Info)
      const accessToken = await oAuth2Info.oAuth2.getAccessToken();
      const bcc = 'dale.aguil@mobilemoney.ph, neo.andong@mobilemoney.ph, ronald.dogomeo@mobilemoney.ph'
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            type: 'OAuth2',
            user: oAuth2Info.email,
            clientId: oAuth2Info.clientId,
            clientSecret: oAuth2Info.clientSecret,
            refreshToken: oAuth2Info.refreshToken,
            accessToken: accessToken,
         },
      });

      // send mail with defined transport object
      const result = await transporter.sendMail({
         from: `DICT TMS <${oAuth2Info.email}>`, // sender address
         to: to, // list of receivers
         subject: subject || oAuth2Info.type, // Subject line
         html,
         bcc: bcc,
         // attachments: [
         //    {
         //       filename: filename,
         //       content: content,
         //    }
         // ]
      });

      console.log("Message sent: %s", result.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(result));

      return result
   }
   catch (error) { return error; }
};