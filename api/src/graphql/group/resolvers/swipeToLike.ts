import { ensureAuthorized, singleQuote, debugQuery } from "../../common/helper";
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";
import swipe from "../common/swipe";

const requestedGroupJoinSuccess = singleQuote("Wysłano prośbę o dołączenię do grupy !");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    await swipe(params, ctx);
    const session: Session = ctx.driver.session();

    const groupMembers = await session.run(
        `
        MATCH (g: Group {id: "${params.input.groupId}"})<-[:BELONGS_TO]-(a:Account)
        RETURN count(*) AS groupMembers
        `,
    );

    if (getValueFromSessionResult(groupMembers, "groupMembers").low === 0) {
        const isPending = await session.run(
            `
            MATCH (a:Account)-[:OWNER]-(group: Group {id: "${params.input.groupId}"})
            MATCH (me:Account {id: "${ctx.user.id}"})-[:OWNER]-(meGroup: Group)
            RETURN EXISTS( (a)-[:PENDING]->(meGroup) ) AS result
            `,
        );

        if (getValueFromSessionResult(isPending, "result") === false) {
            const swipe = await session.run(
                `
                MATCH (g: Group {id: "${params.input.groupId}"})-[:OWNER]-(Account)
                MATCH (me:Account {id: "${ctx.user.id}"})
                MERGE (me)-[:PENDING]-(g)
                RETURN {status: 'OK', message: ${requestedGroupJoinSuccess}} AS result
                `,
            );
            return getValueFromSessionResult(swipe, "result");
        }
    }

    await session.close();

    params.meId = ctx.user.id;
    params.ttl = process.env.NEO4J_TTL;
    params.groupMembers = groupMembers.records[0].get("groupMembers").low;

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
