import { env } from "../../Config/config.service";
import bcrypt from "bcrypt";

export const generateHash = async (
  plainText: string,
  salt: number = env.SALT,
): Promise<string> => {
  return await bcrypt.hash(plainText, salt);
};

export const compareHash = async (
  plainText: string,
  cipherText: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainText, cipherText);
};
