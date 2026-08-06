import { randomInt } from "node:crypto";

const generateOTP = (): string => {
  return String(randomInt(100000, 1000000));
};

export default generateOTP;
