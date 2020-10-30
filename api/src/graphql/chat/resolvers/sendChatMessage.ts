import { redisClient } from "../../../database/redis";
import { ensureAuthorized } from "../../common/helper";
import { pubsub } from "../../pubsub";

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    
    let userId = ctx.user.id;
    let {groupId, message} = params.input;
    
    const chatMessage = {
        userId,
        groupId,
        message,
        date: new Date().getTime()
    }
    
    pubsub.publish(`newChatMessage:${groupId}`, {
        newChatMessage: chatMessage
    });
    
    redisClient.zadd(`chat:${chatMessage.groupId}`, [chatMessage.date, JSON.stringify(chatMessage)], () => {
        // expire chat 2 days after last sent message
        redisClient.expire(`chat:${chatMessage.groupId}`, 60 * 60 * 24 * 2);
    });
    
    return {message: "Wysłano wiadomość", status: "OK"};
};
