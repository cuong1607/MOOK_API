const Joi = require('joi');

/**
 *
 * @param {Joi.AnySchema} schema
 * @returns
 */
function validateBody(schema) {
  return async (req, res, next) => {
    if (!schema) {
      return next();
    }
    try {
      const validatedBody = schema.validateAsync(req.body);
      Object.assign(req.body, validatedBody);
      next();
    } catch (error) {
      // return res.json({ error: error.details[0].message });
      next(error);
    }
  };
}

function validateQuery(schema) {
  return async (req, res, next) => {
    if (!schema) {
      return next();
    }
    try {
      const validatedData = schema.validateAsync(req.query);
      Object.assign(req.query, validatedData);
      next();
    } catch (error) {
      // return res.json({ error: error.details[0].message });
      next(error);
    }
  };
}

module.exports = {
  validateBody,
  validateQuery,
};
