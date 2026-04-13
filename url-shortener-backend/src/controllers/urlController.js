import createShortUrlService from "../services/urlService.js";
import {
  redirectService,
  resolveService,
  getMyUrlsService,
} from "../services/urlService.js";

// 🔹 CREATE SHORT URL
export const createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, expiresAt } = req.body;
    
    // Check if user is authenticated (optional, depends on authMiddleware implementation for this route)
    const userId = req.user ? req.user._id : null;

    if (!longUrl) {
      return res.status(400).json({ error: "Long URL is required" });
    }

    const result = await createShortUrlService({
      longUrl,
      customAlias,
      expiresAt,
      userId
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error.message === "Custom alias is already in use.") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

// 🔹 REDIRECT (302)
export const redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const longUrl = await redirectService(shortId);

    if (!longUrl) {
      return res.status(404).json({ error: "URL not found or expired" });
    }

    return res.redirect(longUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 RESOLVE (for Cache Inspector)
export const resolveUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const result = await resolveService(shortId);

    if (!result) {
      return res.status(404).json({ error: "URL not found" });
    }
    
    if (result.error) {
       return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 GET USER'S URLs (Dashboard)
export const getMyUrls = async (req, res) => {
  try {
    const userId = req.user._id;
    const urls = await getMyUrlsService(userId, 50);
    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 DELETE URL (Dashboard)
export const deleteUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userId = req.user._id;
    
    // Using inline import for deleteUrlService since it was just added
    const { deleteUrlService } = await import("../services/urlService.js");
    
    const success = await deleteUrlService(shortId, userId);
    if (!success) {
      return res.status(404).json({ error: "URL not found or unauthorized" });
    }
    
    res.json({ message: "URL deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};