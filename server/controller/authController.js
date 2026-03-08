import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendSMS } from "../utils/sendSms.js";

export const registerUser = async (req, res) => {
    try {
        const {name, email, password,phone} = req.body;
        const exitingUser = await User.findOne({email});

        if(!name || !email || !password) {
            return res.status(400).json({message: "all fields are required"});
        };
        if(exitingUser) {
            return res.status(400).json({message: "user already exists"});
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const user = await User.create({
            name,
            email,
            phone: phone || null,
            password:hashedPassword,
            otp,
            otpExpire: Date.now() + 5 * 60 * 1000
        });
        const msg = `Hello ${name} Welcome to Agro Vision Your otp is ${otp} valid for 5 minutes`;
        // await sendEmail(email, "Agro-vision OTP Verification",`Welcome to Agro Vision Your otp is ${otp} valid for 5 minutes`);
        await sendEmail(email, msg);

        if(phone) {
            await sendSMS(phone,msg)
        }
        return res.json({message: "OTP sent to your email or phone number"});
    } catch (error) {
        console.error("Register error: ", error);
        res.status(500).json(error);
    };
};

export const verifyOTP = async (req,res) => {  
    try {
        const {email, otp} = req.body;
    const user = await User.findOne({email});

    if(!user) {
        return res.status(404).json({message: "User not found.. "});
    };

    if(user.otp.toString() !== otp.toString()) {
        return res.status(400).json({message: "Invalid otp.."});
    };

    if(!user.otpExpire || user.otpExpire < Date.now()) {
        return res.status(400).json({message: "OTP expired!!"});
    };

    user.verified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({message: "Account verified."});
    } catch (error) {
        res.status(500).json(error);
    }   //otp verification
    
};

//login controller for user 

export const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
    const user = await User.findOne({email});

    if(!user) {
        return res.status(404).json({message: "User not found!!"});
    };
    if(!user.verified) {
        return res.status(401).json({message: "Verify your Email first."});
    }
    const match = await bcrypt.compare(password, user.password);
    if(!match) {
        return res.status(400).json({message: "Wrong password!!"});
    };

    const token = jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    // res.json({
    //     token,
    //     user
    // });
    
    res.json({
        token,
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
        }
    })
    } catch (error) {
        res.status(500).json({message: error.message});
    };
    
};