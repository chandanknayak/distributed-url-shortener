import Url from "../models/urlModel.js";
import redisClient from "../config/redis.js";
import generateShortId from "../utils/shortIdGenerator.js";
import QRCode from "qrcode";

// 🔹 CREATE SHORT URL
const createShortUrlService = async ({ longUrl, customAlias, expiresAt, userId }) => {
  let shortId = customAlias ? customAlias.trim() : generateShortId();

  if (customAlias) {
    // Ensure alias is unique
    const existing = await Url.findOne({ shortId });
    if (existing) {
      throw new Error("Custom alias is already in use.");
    }
  }

  const urlData = { shortId, longUrl };
  if (customAlias) urlData.customAlias = customAlias;
  if (expiresAt) urlData.expiresAt = new Date(expiresAt);
  if (userId) urlData.userId = userId;

  await Url.create(urlData);

  const fullShortUrl = `${process.env.BASE_URL}/${shortId}`;
  
  // Calculate Redis TTL based on expiresAt or default 24 hours
  let ttl = 60 * 60 * 24;
  if (expiresAt) {
    const timeDiff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    if (timeDiff > 0) {
      ttl = timeDiff;
    } else {
      ttl = 60; // if it's already expired or about to expire, cache briefly before DB purges
    }
  }

  await redisClient.set(shortId, longUrl, { EX: ttl });

  // Generate QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(fullShortUrl);

  return {
    shortUrl: fullShortUrl,
    shortId,
    qrCode: qrCodeDataUrl
  };
};

// 🔹 REDIRECT SERVICE
export const redirectService = async (shortId) => {
  const cachedUrl = await redisClient.get(shortId);

  if (cachedUrl) {
    console.log(`Cache HIT: ${shortId}`);
    Url.updateOne({ shortId }, { $inc: { clickCount: 1 } }).exec().catch(console.error);
    return cachedUrl;
  }

  console.log(`Cache MISS: ${shortId}`);

  const url = await Url.findOneAndUpdate(
    { shortId },
    { $inc: { clickCount: 1 } },
    { new: true }
  );

  if (!url) return null;

  // Check expiration
  if (url.expiresAt && new Date() > url.expiresAt) {
    return null; // Link expired
  }

  let ttl = 60 * 60 * 24;
  if (url.expiresAt) {
    ttl = Math.floor((new Date(url.expiresAt).getTime() - Date.now()) / 1000);
    if (ttl <= 0) return null;
  }

  await redisClient.set(shortId, url.longUrl, { EX: ttl });
  return url.longUrl;
};

// 🔹 RESOLVE SERVICE (for Cache Inspector)
export const resolveService = async (shortId) => {
  const cachedUrl = await redisClient.get(shortId);

  if (cachedUrl) {
    console.log(`Cache HIT: ${shortId}`);
    return { longUrl: cachedUrl, cacheStatus: "HIT" };
  }

  console.log(`Cache MISS: ${shortId}`);

  const url = await Url.findOne({ shortId });
  if (!url) return null;

  if (url.expiresAt && new Date() > url.expiresAt) {
    return { error: "Link expired", cacheStatus: "MISS" };
  }

  let ttl = 60 * 60 * 24;
  if (url.expiresAt) {
    ttl = Math.floor((new Date(url.expiresAt).getTime() - Date.now()) / 1000);
  }

  await redisClient.set(shortId, url.longUrl, { EX: ttl > 0 ? ttl : 60 });
  return { longUrl: url.longUrl, cacheStatus: "MISS" };
};

// 🔹 GET MY URLs (For Dashboard)
export const getMyUrlsService = async (userId, limit = 50) => {
  const urls = await Url.find(
    { userId },
    { shortId: 1, longUrl: 1, clickCount: 1, createdAt: 1, expiresAt: 1, _id: 0 }
  )
    .sort({ createdAt: -1 })
    .limit(limit);
    
  // Generate QR codes for dashboard response
  const urlsWithQR = await Promise.all(urls.map(async (url) => {
    const fullUrl = `${process.env.BASE_URL}/${url.shortId}`;
    const qrCode = await QRCode.toDataURL(fullUrl);
    return {
      ...url.toObject(),
      qrCode,
      fullUrl
    };
  }));

  return urlsWithQR;
};

// 🔹 DELETE MY URL (For Dashboard)
export const deleteUrlService = async (shortId, userId) => {
  const url = await Url.findOneAndDelete({ shortId, userId });
  if (url) {
    await redisClient.del(shortId); // Remove from cache
    return true;
  }
  return false;
};

export default createShortUrlService;