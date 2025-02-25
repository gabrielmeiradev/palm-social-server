import jwt from "jsonwebtoken";

const secret = "MMMM";

function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, secret, { expiresIn: "15m" });
}

function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

export { generateAccessToken, getUserIdFromToken };
