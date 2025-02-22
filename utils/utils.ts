import bcrypt from "bcryptjs";

export const makeHash = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyHash = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
