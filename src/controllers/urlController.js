import createShortUrlService from "../services/urlService.js";
import Url from "../models/urlModel.js";

export const createShortUrl = async (req, res) => {
  try {

    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({
        error: "Long URL is required"
      });
    }

    const shortUrl = await createShortUrlService(longUrl);

    res.status(201).json({
      shortUrl
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server Error"
    });

  }
};
export const redirectUrl = async (req, res) => {
  try {

    const { shortId } = req.params;

    const url = await Url.findOneAndUpdate(
      { shortId },
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!url) {
      return res.status(404).json({
        error: "URL not found"
      });
    }

    return res.redirect(url.longUrl);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error"
    });

  }
};