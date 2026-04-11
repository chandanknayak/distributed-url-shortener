import Url from "../models/urlModel.js";
import generateShortId from "../utils/shortIdGenerator.js";

const createShortUrlService = async (longUrl) => {

  const shortId = generateShortId();

  const url = await Url.create({
    shortId,
    longUrl
  });

  return `${process.env.BASE_URL}/${url.shortId}`;
};

export default createShortUrlService;