import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    shortId:{
        type:String,
        required:true,
        unique:true,
    },
    redirectURL:{
        type:String,
        required:true,
    },
    clickLog:[{
        timestamp: { type: Date, default: Date.now },
        referrer: { type: String, default: "" },
        userAgent: { type: String, default: "" },
        ip: { type: String, default: "" }
    }],
    totalClicks: { type: Number, default: 0 },
    expiresAt: { type: Date, index: { expires: 0 } },
    qrCodeImage: { type: String },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    }
},{timestamps:true});

const urlModel = mongoose.model('Url', urlSchema);
export default urlModel;