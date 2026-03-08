import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        // user: process.env.EMAIL_USER,
        // pass: process.env.EMAIL_PASS
        user: "agrovision49@gmail.com",
        pass: "xvkdrkrxygybbvka",
    }
});

export const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
        // from: process.env.EMAIL_USER,
        from: 'AgroVision <agrovision49@gmail.com>',
        to,
        subject,
        text
    });
    // console.log("email sent: ", info.response);
    // console.log("EMAIL_USER:", process.env.EMAIL_USER);
    // console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
    } catch (error) {
        console.log("email error ", error);
        throw error;
    }
    
};