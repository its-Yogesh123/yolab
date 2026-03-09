import shortid from "shortid";
import urlModel from "./srv001.model.js";

export const generateShortUrl = async (req, res) => {
  try {
    const { redirectURL } = req.body || {};
    if (!redirectURL) {
      return res.status(400).json({
        message: "redirectURL is required",
      });
    }
    const shortId = shortid.generate();
    const doc = await urlModel.create({
      shortId,
      redirectURL,
      visitedHistory: [],
      createdBy: req.user && req.user.id ? req.user.id : undefined,
    });
    return res.status(201).json({
      data: {
        shortId: doc.shortId,
        redirectURL: doc.redirectURL,
        _id: doc._id,
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        message: "Generated shortId already exists. Please try again.",
      });
    }

    console.error("Error generating short URL:", error);
    return res.status(500).json({
      message: "Internal server error while generating short URL",
    });
  }
};

export const getRedirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    if (!shortId) {
      return res.status(400).json({
        message: "shortId is required in URL params",
      });
    }

    const doc = await urlModel.findOne({ shortId });

    if (!doc) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    doc.visitedHistory.push(Date.now());
    await doc.save();

    return res.redirect(doc.redirectURL);
    // return res.json(
    //     {"url":doc.redirectURL}
    // );
  } catch (error) {
    console.error("Error handling short URL redirect:", error);
    return res.status(500).json({
      message: "Internal server error while redirecting",
    });
  }
};
