import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import pendingRequest from '../common/pendingRequest';

export default async (obj, params, ctx, resolveInfo) => {

    try {
        await pendingRequest(params, ctx);
    } catch (error) {
        throw error;
    }

    const session: Session = ctx.driver.session();

    const distributionOfVotes = await session.run(
        `
        MATCH (a: Account {id: "${params.input.userId}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        MATCH ( (a)-[vf:VOTE_AGAINST]-(g) )
        RETURN count(vf) as result
        UNION ALL
        MATCH (g: Group{id: "${params.input.groupId}"})-[b:BELONGS_TO]-(a:Account)
        RETURN count(b) as result
        `
    );

    await session.close();

    const countOfVoteAgainst = distributionOfVotes.records[0].get("result").low;
    const countOfGroup = distributionOfVotes.records[1].get("result").low;

    params.distributionOfVotes = (countOfVoteAgainst+1)/countOfGroup;
    params.meId = ctx.user.id;

    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};