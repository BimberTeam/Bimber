import { isAuthorized } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

const requestedToJoinToGroup = "'Wysłano prośbę o dołączenię do grupy !'"
const userAlreadyBelongsToGroup = "'Już należysz do podanej grupy !'";
const alreadyPendingToGroup = "'Już oczekujesz na dołącznie do tej grupy !'";

export default async (obj, params, ctx, resolveInfo) => {

    const session: Session = ctx.driver.session();
    isAuthorized(ctx);

    const alreadyBelongsTo = await session.run(
        `
        MATCH (g: Group {id: "${params.id}"}), (a:Account {id: "${ctx.user.id}"})
        RETURN EXISTS((g)<-[:BELONGS_TO]-(a)) AS result
        `,
    );

    if (getValueFromSessionResult(alreadyBelongsTo, "result") === true) {
        throw new ApolloError(userAlreadyBelongsToGroup, "200", [userAlreadyBelongsToGroup]);
    }

    const alreadyPending = await session.run(
        `
        MATCH (group: Group {id: "${params.id}"})
        MATCH (me:Account {id: "${ctx.user.id}"})
        RETURN EXISTS( (me)-[:PENDING]->(group) ) AS result
        `,
    )

    if (getValueFromSessionResult(alreadyPending, "result") === true) {
        throw new ApolloError(alreadyPendingToGroup, "200", [alreadyPendingToGroup]);
    }

    const membersCount = await session.run(
        `
        MATCH (g: Group {id: "${params.id}"})<-[:BELONGS_TO]-(a:Account)
        RETURN count(*) AS membersCount
        `,
    );

    if (getValueFromSessionResult(membersCount, "membersCount").low === 0) {
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
                RETURN {status: 'OK', message: ${requestedToJoinToGroup}} AS result
                `,
            );
            return getValueFromSessionResult(swipe, "result");
        }
    }

    await session.close();

    params.meId = ctx.user.id;
    params.ttl = process.env.NEO4J_TTL;
    params.membersCount = membersCount.records[0].get("membersCount").low;

    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
