import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Очень много запросов, повторите запрос позже',
})