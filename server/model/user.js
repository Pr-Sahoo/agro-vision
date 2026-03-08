import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: null
    },
    password:{
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    // otp: {
    //     type: String
    // },
    otp: String,
    otpExpire: Date,
    language: {
        type: String,
        default: "en"
    }
},{timestamps: true});

export default mongoose.model("User", userSchema);