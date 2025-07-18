import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // const { success } = await ratelimit.limit("Hello_world_upstash");
    const key = req.user?.userId || req.ip; // userId if logged in, IP if not
    const { success } = await ratelimit.limit(key);

    if (!success) {
      return res
        .status(429)
        .send({ message: "Too many request, please try later" });
    }
    next();
  } catch (err) {
    console.error("Rate limit error", err);
    next(err);
  }
};

export default rateLimiter;
