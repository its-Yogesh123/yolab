import mongoose from "mongoose";

/**
 * QR Code schema (srv002)
 * Stores metadata for each generated QR code.
 */
const qrCodeSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true, // URL or text to encode
    },
    format: {
      type: String,
      enum: ["png", "svg"],
      default: "png",
    },
    size: {
      type: Number,
      default: 300,
    },
    darkColor: {
      type: String,
      default: "#000000",
    },
    lightColor: {
      type: String,
      default: "#ffffff",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const QRCode = mongoose.model("QRCode", qrCodeSchema);
export default QRCode;
