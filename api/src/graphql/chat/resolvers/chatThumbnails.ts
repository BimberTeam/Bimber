import { Session } from "neo4j-driver";
import { redisClient } from "../../../database/redis";
import { ensureAuthorized } from "../../common/helper";
import { pubsub } from "../../pubsub";

const fetchLastGroupMessage = async (groupId: string) => {
    const message = await new Promise((resolve, reject) =>
        redisClient.zrevrangebyscore(`chat:${groupId}`, "+inf", "-inf", "limit", 0, 1, (err, reply) => {
            if (err) {
                return reject(err);
            }
            const messages = reply.map(val => JSON.parse(val));
            return resolve(messages.length === 0 ? null : messages[0]);
        })
    );
    return message;

};

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);

    const session: Session = ctx.driver.session();

    const result = await session.run(
        `
        MATCH (a:Account{id: "${ctx.user.id}"})-[:BELONGS_TO]->(g:Group)<-[:BELONGS_TO *0..]-(members:Account{}) 
        RETURN g.id as groupId, apoc.text.join(collect(members.name), ", ") as name
        `,
    );

    const thumbnails = result.records.map(async (r) => {
        const groupId  = r.get("groupId");
        const name = r.get("name");
        const lastMessage = await fetchLastGroupMessage(groupId);
        return {groupId, name, lastMessage: lastMessage}
    });


    await session.close();

    return thumbnails; 
};