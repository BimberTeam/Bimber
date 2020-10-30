import { redisClient } from "../../../database/redis";
import { ensureAuthorized } from "../../common/helper";

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    
    const groupId = params.input.groupId;
    const limit = params.input.limit || 100;
    const lastDate = params.input.lastDate || "+inf";
    
    let response = await new Promise((resolve, reject) => 
        redisClient.zrevrangebyscore(`chat:${groupId}`, lastDate, "-inf", "limit", lastDate == "+inf" ? 0 : 1, limit, (err, reply) => {
            if (err) {
                return reject(err);
            }
            const messages = reply.map(val => JSON.parse(val));
            return resolve(messages);
        })
    );
    
    return response; 
};
