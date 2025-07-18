import jwt from "jsonwebtoken";

// import dotenv from "dotenv";
// dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}
const jwtSecret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  // Look for token in Authorization header, cookies, or body
  const authHeader = req.get("Authorization");
  /* const authHeader =
    req.headers["authorization"] ||
    req.get("Authorization") ||
    req.headers["Authorization"]; */

  const tokenFromHeader = authHeader && authHeader.split(" ")[1];
  const tokenFromCookie = req.cookies?.token;
  const tokenFromBody = req.body?.token;

  // Pick the token from the first available source
  const token = tokenFromHeader || tokenFromCookie || tokenFromBody;

  /* LOGS FOR DEBUGGING */
  // console.log("🧪 Header A:", req.headers["Authorization"]);
  // console.log("🧪 Header a:", req.headers["authorization"]);
  // console.log("🧪 Header a get:", req.get("Authorization"));
  // console.log("🧪 Cookie:", req.cookies?.token);
  // console.log("🧪 Body:", req.body?.token);

  if (!token) {
    return res.sendStatus(401); // Unauthorized - token missing
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error("❌ JWT verification error:", err.message);
      return res.sendStatus(403); // Forbidden - invalid token
    }
    req.user = user;
    next();
  });
};

export { authenticateToken };
