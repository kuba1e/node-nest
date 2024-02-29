import jwt from "jsonwebtoken";

const jwtAccessSecretKey = process.env.ACCESS_SECRET_KEY;

export async function validateAccessToken<P>(accessToken: string) {
  try {
    let decodedToken = "" as P;
    jwt.verify(accessToken, jwtAccessSecretKey, (error, decoded) => {
      if (error) {
        throw new Error("User is unauthorized");
      }
      decodedToken = decoded as P;
    });

    return decodedToken;
  } catch (error) {
    throw new Error(error.message);
  }
}
