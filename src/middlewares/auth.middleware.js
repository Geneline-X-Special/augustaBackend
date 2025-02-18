import pkg from "jsonwebtoken";
const { verify } = pkg;
import { jwtSecret } from "../config/default.config.js";

/**
 * @desc   Extracts the authentication token from the request headers.
 * @param  {Object} req - Express request object
 * @returns {string|null} - Returns the token string if found, otherwise null.
 */
const getAuthToken = (req) => {
  try {
    // Retrieve the Authorization header
    const authHeader = req.headers.authorization || null;

    // Validate header format (must start with "Bearer ")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization header missing or incorrect format." });
    }

    // Extract and return the token from "Bearer <token>"
    return authHeader.split(" ")[1];
  } catch (error) {
    console.error("GET AUTH TOKEN ERROR: ", error);
    throw error;
  }
};

/**
 * @desc   Middleware to ensure that the request is authenticated.
 * @param  {Object} req - Express request object
 * @param  {Object} res - Express response object
 * @param  {Function} next - Express next function
 */
export const requireAuthenticatedUser = async (req, res, next) => {
  try {
    // Retrieve the token from the request headers
    const token = getAuthToken(req);

    if (!token) {
      return res
        .status(400)
        .json({ message: "Invalid/Missing Authentication Token" });
    }

    // Verify and decode the JWT token
    const decodedToken = verify(token, jwtSecret);

    // Attach user ID to the request object for further processing
    req.user = {
      userId: decodedToken.userId,
    };

    return next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("REQUIRE AUTHENTICATED USER ERROR: ", error);

    // Handle specific JWT errors
    if (error.message === "invalid signature") {
      return res
        .status(401)
        .json({ message: "Invalid Authentication Token. Please Try Again" });
    }
    if (error.message == "jwt expired") {
      return res
        .status(401)
        .json({ message: "Session Expired. Please Login to Continue" });
    }

    return res
      .status(401)
      .json({ message: "Authentication Failed. Please Try Again!" });
  }
};
