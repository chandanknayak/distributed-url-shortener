import { nanoid } from "nanoid";

const generateShortId = () => {
  return nanoid(7);
};

export default generateShortId;