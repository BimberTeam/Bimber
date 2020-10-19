import { debugQuery } from './../../common/helper';
import { votesDistribution as votesDistributionFun , VotesDistribution } from './../common/pendingRequest';
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import pendingRequest from '../common/pendingRequest';

export default async (obj, params, ctx, resolveInfo) => {

    await pendingRequest(params, ctx);

    const session: Session = ctx.driver.session();

    const votesDistribution: VotesDistribution = await votesDistributionFun(params, ctx, "VOTE_AGAINST");

    await session.close();

    params.votesDistribution = votesDistribution.getVotesDistribution();
    params.meId = ctx.user.id;

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};