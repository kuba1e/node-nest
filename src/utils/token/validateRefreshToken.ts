import { Response } from "express";
import jwt from "jsonwebtoken";

const jwtRefreshSecretKey = process.env.REFRESH_SECRET_KEY;

export const validateRefreshToken = async (
  refreshToken: string,
  response: Response
) => {
  try {
    return jwt.verify(refreshToken, jwtRefreshSecretKey, (error, decoded) => {
      if (error) {
        throw new Error("User is unauthorized");
      }
      return decoded;
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
