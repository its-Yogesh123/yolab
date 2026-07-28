import QRCode from "qrcode";
import QRCodeDoc from "./srv002.model.js";

/**
 * POST /srv002/qr
 * Generate a QR code image and save metadata.
 * Returns base64 PNG data URL for immediate display.
 */
export const generateQRCode = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n--- [generateQRCode Controller] STARTED ---`);
      console.log(`[generateQRCode] Request body:`, req.body);
      console.log(`[generateQRCode] req.user:`, req.user);
      console.log(`[generateQRCode] req.subscription:`, req.subscription);
    }

    const {
      content,
      format = "png",
      size = 300,
      darkColor = "#000000",
      lightColor = "#ffffff",
    } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required to generate a QR code." });
    }

    // Generate QR code as base64 data URL
    const qrOptions = {
      type: "image/png",
      width: size,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "H",
    };

    const qrDataUrl = await QRCode.toDataURL(content.trim(), qrOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[generateQRCode] QR Code generated successfully as base64.`);
    }

    // Save metadata to DB
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[generateQRCode] DB WRITE COMMENTED OUT: Would have saved metadata to DB.`);
    }
    const doc = await QRCodeDoc.create({
      content: content.trim(),
      format,
      size,
      darkColor,
      lightColor,
      createdBy: req.user.id,
    });
    // const doc = {
    //   _id: "mock_qr_id_for_debugging",
    //   content: content.trim(),
    //   size,
    //   darkColor,
    //   lightColor,
    //   createdAt: new Date()
    // };

    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- [generateQRCode Controller] FINISHED (Returning 201) ---\n`);
    }
    return res.status(201).json({
      message: "QR code generated successfully.",
      data: {
        id: doc._id,
        content: doc.content,
        qrImage: qrDataUrl,   // base64 PNG
        size: doc.size,
        darkColor: doc.darkColor,
        lightColor: doc.lightColor,
        createdAt: doc.createdAt,
      },
      // Pass subscription info from middleware to frontend
      subscription: req.subscription,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return res.status(500).json({ message: "Failed to generate QR code." });
  }
};

/**
 * GET /srv002/qr
 * List all QR codes created by the logged-in user.
 */
export const getMyQRCodes = async (req, res) => {
  try {
    const docs = await QRCodeDoc.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      count: docs.length,
      data: docs.map((d) => ({
        id: d._id,
        content: d.content,
        size: d.size,
        darkColor: d.darkColor,
        lightColor: d.lightColor,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /srv002/qr/:id
 * Delete a QR code (only the creator can delete).
 */
export const deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await QRCodeDoc.findOne({ _id: id, createdBy: req.user.id });

    if (!doc) {
      return res.status(404).json({ message: "QR code not found or access denied." });
    }

    await doc.deleteOne();
    return res.status(200).json({ message: "QR code deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
