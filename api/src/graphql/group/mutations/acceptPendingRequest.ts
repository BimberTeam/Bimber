import { debugQuery } from './../../common/helper';
import { votesDistribution as votesDistributionFun , VotesDistribution } from './../common/pendingRequest';
import { neo4jgraphql } from "neo4j-graphql-js";
import pendingRequest from '../common/pendingRequest';

export default async (obj, params, ctx, resolveInfo) => {
    await pendingRequest(params, ctx);
    const votesDistribution: VotesDistribution = await votesDistributionFun(params, ctx, "VOTE_IN_FAVOUR");

    params.votesDistribution = votesDistribution.getVotesDistribution();
    console.log(params.votesDistribution);
    params.meId = ctx.user.id;

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};