import Joi from "joi";
import { errorResponse } from "../utils/api.response.js";

export async function validateRegistration(req, res, next) {
  try {
    const schema = Joi.object({
      username: Joi.string().required().label("Username"),
      password: Joi.string().min(6).required().label("Password"),
    });

    const { error } = schema.validate(req.body);
    if (error) return errorResponse(error.message, res);

    return next();
  } catch (ex) {
    return errorResponse(ex.message, res);
  }
}

export async function validateLogin(req, res, next) {
  try {
    const schema = Joi.object({
      username: Joi.string().required().label("Username"),
      password: Joi.string().min(6).required().label("Password"),
    });

    const { error } = schema.validate(req.body);
    if (error) return errorResponse(error.message, res);

    return next();
  } catch (ex) {
    return errorResponse(ex.message, res);
  }
}
