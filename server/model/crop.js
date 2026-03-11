// import mongoose from "mongoose";

// const cropSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//         index: true
//     },
//     cropName: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     cropType: {
//         type: String,
//         enum: {
//             values: ["cereal", "vegetable", "fruit", "legume", "oilseed", "spice", "other"],
//             message: '{VALUE} not a valid crop type'
//         },
//         default: "other"
//     },
//     area: {
//         value: {type: Number, required: true},
//         unit: {type: String, enum: ["acres", "hectares","sqm"], default: "acres"},
//     },
//     soilType: {
//         type: String,
//         enum: {
//             values: ["clay", "sandy", "loamy", "silt", "peaty", "chalky", "mixed"],
//             message: '{VALUE} not found'
//         },
//         required: true
//     },
//     sowingDate: {
//         type: Date,
//         required: true
//     },
//     expectedHarvestDate: {
//         type: Date,
//         required: true,
//     },
//     location: {
//         name: {type: String},
//         latitude: {type: Number, required: true},
//         longitude: {type: Number, required: true}
//     },
//     notes: {
//         type: String,
//         default: ""
//     },
//     lastAdviceSentAt: {
//         type: Date,
//         default: null
//     },
//     lastAiResponse: {
//         type: String,
//         default: null
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     }
// },{timestamps: true});

// export default mongoose.model("Crop", cropSchema);

import mongoose from "mongoose";

const aiHistorySchema = new mongoose.Schema({
    role: {type: String, enum: ["user", "assistant"], required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now()}
},{_id: false});

const cropSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    cropName: {type: String, required: true, trim: true},
    // cropType: {type: String, required: true, enum: {values: ["cereal", "vegetable", "fruit", "legume", "oilseed", "spice", "other"], message: '{values} not matched '}, default: "other"},
    cropType: {type: String, required: true, trim: true},
    variety: {type: String, required: true},
    area: {type: Number},
    areaUnit: {type: String, default: "acres"},
    soilType: {type: String, default: "loamy", trim: true},
    plantingDate:{type: Date},
    harvestTarget: {type: Date},
    location: {
        lat:{type: Number, required: true},
        lon: {type: Number, required: true},
        city: {type: String, trim: true}
    },
    aiHistory: [aiHistorySchema],
    lastAdviceAt: {type:Date},
    notifyEmail: {type: Boolean, default: true},
    notifySms: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true}
},{timestamps: true});

export default mongoose.model("Crop", cropSchema);