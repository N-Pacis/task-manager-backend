import Joi from "joi";
import { errorResponse } from "../utils/api.response.js";

export async function validateTaskCreation(req, res, next) {
  try {
    const schema = Joi.object({
      name: Joi.string().required().label("Name"),
      description: Joi.string().min(6).label("Description"),
      parent_task_id: Joi.number().allow(null).label("Parent Task"),
    });

    const { error } = schema.validate(req.body);
    if (error) return errorResponse(error.message, res);

    return next();
  } catch (ex) {
    return errorResponse(ex.message, res);
  }
}
