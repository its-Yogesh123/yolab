import jwt from "jsonwebtoken";

const DEFAULT_TOKEN_EXPIRY = "7d";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }
  return process.env.JWT_SECRET;
};

export const generateToken = (payload, options = {}) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("A valid payload object is required to generate token");
  }

  const secret = getJwtSecret();
  const { expiresIn = DEFAULT_TOKEN_EXPIRY, ...restOptions } = options;

  return jwt.sign(payload, secret, {
    expiresIn,
    ...restOptions,
  });
};

export const validateToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("A valid token string is required for validation");
  }

  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};
