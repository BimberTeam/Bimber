import { mapLocationAndGetProperties } from '../common/helper';
import { executeQuery } from './../../common/helper';
import { ensureAuthorized, singleQuote, debugQuery, groupExists, userBelongsToGroup} from "../../common/helper";
import { ApolloError } from "apollo-server"
import { Session, Point} from "neo4j-driver";

const groupDoesNotExistError = singleQuote("Podana grupa nie istnieje !");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy !");

interface Coords{
    latitude: number
    longitude: number
}

interface Neo4jNumber {
    low: number,
    high: number
}

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (!await groupExists(session, params.input.groupId)) {
        throw new ApolloError(groupDoesNotExistError, "400", [groupDoesNotExistError]);
    }

    if (!await userBelongsToGroup(session, params.input.groupId, ctx.user.id)) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    const groupMembersQuery = `
        MATCH (group:Group{id: "${params.input.groupId}"})
        MATCH (a:Account)-[b:BELONGS_TO]->(group)
        RETURN count(a) as result
    `;

    const groupMembers = await executeQuery<Neo4jNumber>(session, groupMembersQuery);

    const groupCandidatesQuery = `
        MATCH (g:Group{id: "${params.input.groupId}"})
        MATCH (a: Account)-[:PENDING]->(g)
        WHERE ((g)-[:VOTE_AGAINST{id: "${ctx.user.id}"}]->(a)) OR ((g)-[:VOTE_IN_FAVOUR{id: "${ctx.user.id}"}]->(a))
        RETURN collect(a) AS result
    `;

    let groupCandidatesList = await executeQuery<any>(session, groupCandidatesQuery);
    let groupCandidatesResultPayloadList = [];

    groupCandidatesList = mapLocationAndGetProperties(groupCandidatesList);

    for(let user of groupCandidatesList ) {

        const countVotesInFavourQuery = `
            MATCH (g:Group{id: "${params.input.groupId}"})
            MATCH (a: Account{id: "${user.id}"})
            MATCH (a)-[vf:VOTE_AGAINST]-(g)
            RETURN count(vf) as result
        `;

        const votesInFavour = await executeQuery<Neo4jNumber>(session, countVotesInFavourQuery);

        const countVotesAgainstQuery = `
            MATCH (g:Group{id: "${params.input.groupId}"})
            MATCH (a: Account{id: "${user.id}"})
            MATCH (a)-[vf:VOTE_IN_FAVOUR]-(g)
            RETURN count(vf) as result
        `;

        const votesAgainst = await executeQuery<Neo4jNumber>(session, countVotesAgainstQuery);

        groupCandidatesResultPayloadList.push({
            "user": user,
            "votesAgainst": votesInFavour.low,
            "votesInFavour": votesAgainst.low,
            "groupCount": groupMembers.low
        })
    }

    await session.close();

    return groupCandidatesResultPayloadList;
};