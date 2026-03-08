// import axios from "axios";

// export const sendSMS = async(phone, message) => {
//     try {
//         const response = await axios.get(
//             "https://www.fast2sms.com/dev/bulkV2",{
//                 params: {
//                     route: "v3",
//                     message: message,
//                     language: "english",
//                     flash: 0,
//                     numbers: phone
//                 },
//                 headers: {
//                     // authorization: process.env.FAST2SMS_APIKEY
//                     authorization:"9pJU2roujdcnyyEdoxmDwn6XiHLAPevMbKkhwcjexKtEoTbvpo587lLunwVT"
//                 }
//             });
//             console.log("Response: ", response.data);
//     } catch (error) {
//         console.log("SMS error: ", error.response?.data || error.message)
//     };
// };

// import twilio from "twilio";

// const client = twilio(
//     process.env.TWILIO_AC_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );

// export const sendSMS = async(phone, message) => {
//     try {
//         const response = await client.messages.create({
//             body: message,
//             from: process.env.TWILIO_PH,
//             to: phone,
//         });
//         console.log("SMS sent: ", response.sid);
//     } catch (error) {
//         console.log("SMS failed ", error.message);
//     };
// };

// import twilio from "twilio";

// const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );

// export const sendSMS = async(phone, message) => {
//     try {
//         const formated = phone.startsWith("+")?phone: `+91${phone}`;
//         const response = await client.messages.create({
//             body: message,
//             from: process.env.TWILIO_PHONE_NUMBER,
//             to: phone
//         });
//         console.log("SMS sent: ",response.sid);
//     } catch (error) {
//         console.log("SMS failed ", error.message);
//     };
// };

import twilio from "twilio";

const client = twilio(
    "AC1f4b361112d0fc1fa3bf1ac38a3c00e6",
    "e7467cce41f429ebcb19565f9253d9d2"
);

export const sendSMS = async(phone, messages) => {
    try{
        const formated = phone.startsWith("+")?phone:`+91${phone}`;
        const  response = await client.messages.create({
            body: messages,
            from: "+14197653812",
            to: formated
        });
        console.log("SMS sent: ",response.sid);
    }catch(error) {
        console.log("SMS failed: ",error.message);
    };
};