import { ensureAuthorized, singleQuote, debugQuery } from "./../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

const requestedGroupJoinSuccess = singleQuote("Wysłano prośbę o dołączenię do grupy !");
const lackingMembershipError = singleQuote("Już należysz do podanej grupy !");
const alreadyPendingError = singleQuote("Już oczekujesz na dołącznie do tej grupy !");
const groupOwnerError = singleQuote("Jesteś właścicielem podanej grupy !");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    const alreadyGroupOwner = await session.run(
        `
        MATCH (g: Group {id: "${params.id}"}), (a:Account {id: "${ctx.user.id}"})
        RETURN EXISTS((g)<-[:OWNER]-(a)) AS result
        `,
    );

    if (getValueFromSessionResult(alreadyGroupOwner, "result") === true) {
        throw new ApolloError(groupOwnerError, "200", [groupOwnerError]);
    }

    const alreadyBelongsTo = await session.run(
        `
        MATCH (g: Group {id: "${params.id}"}), (a:Account {id: "${ctx.user.id}"})
        RETURN EXISTS((g)<-[:BELONGS_TO]-(a)) AS result
        `,
    );

    if (getValueFromSessionResult(alreadyBelongsTo, "result") === true) {
        throw new ApolloError(lackingMembershipError, "200", [lackingMembershipError]);
    }

    const alreadyPending = await session.run(
        `
        MATCH (group: Group {id: "${params.id}"})
        MATCH (me:Account {id: "${ctx.user.id}"})
        RETURN EXISTS( (me)-[:PENDING]->(group) ) AS result
        `,
    )

    if (getValueFromSessionResult(alreadyPending, "result") === true) {
        throw new ApolloError(alreadyPendingError, "200", [alreadyPendingError]);
    }

    const groupMembers = await session.run(
        `
        MATCH (g: Group {id: "${params.id}"})<-[:BELONGS_TO]-(a:Account)
        RETURN count(*) AS groupMembers
        `,
    );

    if (getValueFromSessionResult(groupMembers, "groupMembers").low === 0) {
        const isPending = await session.run(
            `
            MATCH (group: Group {id: "${params.id}"})-[:OWNER]-(a:Account)
            MATCH (meGroup: Group)-[b:OWNER]-(me:Account {id: "${ctx.user.id}"})
            RETURN EXISTS( (a)-[:PENDING]->(meGroup) ) AS result
            `,
        );

        if (getValueFromSessionResult(isPending, "result") === false) {
            const swipe = await session.run(
                `
                MATCH (g: Group {id: "${params.id}"})-[:OWNER]-(Account)
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
