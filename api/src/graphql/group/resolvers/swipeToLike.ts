import { executeQuery, Message } from './../../common/helper';
import { ensureAuthorized, singleQuote, debugQuery } from "../../common/helper";
import { Session, Integer } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import validateSwipe from "../common/validateSwipe";

const requestedGroupJoinSuccess = singleQuote("Wysłano prośbę o dołączenię do grupy !");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    await validateSwipe(params, ctx);
    const session: Session = ctx.driver.session();

    const groupMembersQuery =
        `
        MATCH (g: Group {id: "${params.input.groupId}"})<-[:BELONGS_TO]-(a:Account)
        RETURN count(*) AS groupMembers
        `;

    const groupMembers = await executeQuery<Integer>(session, groupMembersQuery, "groupMembers");

    if (groupMembers.low === 0) {

        const userAlreadyPendingToGroupQuery =
            `
            MATCH (a:Account)-[:OWNER]-(group: Group {id:"${params.input.groupId}"})
            MATCH (me:Account {id:"${ctx.user.id}"})-[:OWNER]-(meGroup: Group)
            RETURN EXISTS( (a)-[:PENDING]->(meGroup) ) AS result
            `;

        if (!await executeQuery<boolean>(session, userAlreadyPendingToGroupQuery)) {

            const swipeQuery =
                `
                MATCH (g: Group {id: "${params.input.groupId}"})-[:OWNER]-(Account)
                MATCH (me:Account {id: "${ctx.user.id}"})
                MERGE (me)-[:PENDING]-(g)
                RETURN {status: 'OK', message: ${requestedGroupJoinSuccess}} AS result
                `;

            return await executeQuery<Message>(session, swipeQuery);
        }
    }

    await session.close();

    params.meId = ctx.user.id;
    params.ttl = process.env.NEO4J_TTL;
    params.groupMembers = groupMembers.low;

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
