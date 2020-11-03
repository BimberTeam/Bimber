import { Session } from "neo4j-driver";
import { redisClient } from "../../../database/redis";
import { ensureAuthorized, getValueFromSessionResult } from "../../common/helper";
import { pubsub } from "../../pubsub";

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    
    let userId = ctx.user.id;
    let {groupId, message} = params.input;
    
    const session: Session = ctx.driver.session();

    const result = await session.run(
        `
        MATCH (a:Account{id: "${userId}"})
        RETURN a.name as name
        `,
    );
    
    const name = getValueFromSessionResult(result, "name");
    
    const chatMessage = {
        userId,
        groupId,
        message,
        name,
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
