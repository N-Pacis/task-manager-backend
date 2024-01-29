import { errorResponse, unauthorizedResponse } from "../utils/api.response.js";
import { verifyToken } from "../utils/jwt.utils.js";

export default function (req, res, next) {
  if (!req.header("auth-token"))
    return unauthorizedResponse("Access denied! you must be logged in",res);

  var token = req.header("auth-token").trim();

  if (!token)
    return unauthorizedResponse("Access denied! you must be logged in",res);
  try {
    req.user = verifyToken(token)
    next();
  } catch (ex) {
    return errorResponse("Invalid token!", res);
  }
}
