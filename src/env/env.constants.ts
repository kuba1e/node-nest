import * as Joi from 'joi';

export const ENV_VALIDATION_SCHEMA = Joi.object({
  PORT: Joi.number().required(),
  SALT_ROUNDS: Joi.number().required(),
  ACCESS_SECRET_KEY: Joi.required(),
  REFRESH_SECRET_KEY: Joi.required(),
  DATABASE_NAME: Joi.required(),
  DATABASE_USER_NAME: Joi.required(),
  DATABASE_USER_PASSWORD: Joi.required(),
  DATABASE_HOST: Joi.required(),
  DATABASE_PORT: Joi.number().required(),
  AWS_SQS_QUEUE_URL: Joi.required(),
  AWS_ACCESS_KEY_ID: Joi.required(),
  AWS_SECRET_ACCESS_KEY: Joi.required(),
});
