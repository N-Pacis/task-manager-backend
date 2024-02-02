import { config } from "dotenv";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

config({ path: "./.env" });

const secret = process.env.JWT_KEY || '';

export const signToken = (payload) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = Math.floor(Date.now() / 1000) + 1800000;
  const jti = uuidv4();

  const token = jwt.sign(
    {
      ...payload,
      iat,
      exp,
      jti,
    },
    secret
  );

  return token;
};

export const verifyToken = (token) => {
  token = token.replace("Bearer", "").trim();
  return jwt.verify(token, secret);
};
