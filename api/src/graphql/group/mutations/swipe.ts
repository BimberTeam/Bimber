import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../utils/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();
    if (ctx.user === null) {
        throw new ApolloError("Not authorized", "405", ["You are not allowed to do that"]);
    }

    const alreadyBelongsTo = await session.run(
        `
        MATCH (g: Group {id: ${params.id}}), (a:Account {id: ${ctx.user.id.low}})
        RETURN EXISTS((g)<-[:BELONGS_TO]-(a)) AS result
        `,
    );

    if (getValueFromSessionResult(alreadyBelongsTo, "result") === true) {
        throw new ApolloError("You already belongs to this group !", "200", ["You already belongs to this group!"]);
    }

    const membersCount = await session.run(
        `
        MATCH (g: Group {id: ${params.id}})<-[:BELONGS_TO]-(a:Account)
        RETURN count(*) AS membersCount
        `,
    );

    if (getValueFromSessionResult(membersCount, "membersCount").low === 0) {
        const alreadyMatched = await session.run(
            `
            MATCH (g: Group {id: ${params.id}})-[:OWNER]-(a:Account)
            MATCH (me:Account {id: ${ctx.user.id.low}})
            MATCH (group)<-[:BELONGS_TO]-(a)
            MATCH (group)<-[:BELONGS_TO]-(me)
            RETURN group
            `,
        );

        if (alreadyMatched.records.length !== 0) {
            throw new ApolloError("You already belongs to this group !", "200", ["You already belongs to this group!"]);
        }

        const isPending = await session.run(
            `
            MATCH (group: Group {id: ${params.id}})-[:OWNER]-(a:Account)
            MATCH (meGroup: Group)-[b:OWNER]-(me:Account {id: ${ctx.user.id.low}})
            RETURN EXISTS( (a)-[:PENDING]->(meGroup) ) AS result
            `,
        );

        if (getValueFromSessionResult(isPending, "result") === false) {
            const checkPending = await session.run(
                `
                MATCH (g: Group {id: ${params.id}})-[:OWNER]-(Account)
                MATCH (me:Account {id: ${ctx.user.id.low}})
                MERGE (me)-[:PENDING]-(g)
                RETURN 'ok' AS result
                `,
            );
            return getValueFromSessionResult(checkPending, "result");
        }
    } else {
        const alreadyRequested = await session.run(
            `
            MATCH (g: Group {id: ${params.id}}), (a:Account {id: ${ctx.user.id.low}})
            RETURN EXISTS((g)<-[:REQUESTED]-(a)) AS result
            `,
        );

        if (alreadyRequested.records[0].get("result") === true) {
            throw new ApolloError("You already requested to this group !",
                "200", ["You already requested to this group!"]);
        }
    }
    await session.close();
    params.meId = ctx.user.id.low;
    params.ttl = process.env.NEO4J_TTL;
    params.membersCount = membersCount.records[0].get("membersCount").low;

    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
