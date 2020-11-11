import { executeQuery } from './../../common/helper';
import { ensureAuthorized, singleQuote, debugQuery, groupExists, userBelongsToGroup} from "../../common/helper";
import { ApolloError } from "apollo-server"
import { Session, Point} from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const groupDoesNotExistError = singleQuote("Podana grupa nie istnieje !");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy !");

interface Coords{
    latitude: number
    longitude: number
}

const mapPointToLocation = (point: Point): Coords  => {
    return {
        "latitude": point && point['x'] || null,
        "longitude": point && point['y'] || null,
    };
}

const mapLocationAndGetProperties = (list: any): any =>  {
    return list.map(
        element => {
            element["properties"]['latestLocation'] = mapPointToLocation(element["properties"]['latestLocation']);
            return element["properties"];
        });
};

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (await groupExists(session, params.input.groupId) === false) {
        throw new ApolloError(groupDoesNotExistError, "400", [groupDoesNotExistError]);
    }

    if (await userBelongsToGroup(session, params.input.groupId, ctx.user.id) === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    const groupCandidatesResultQuery = `
        MATCH (g:Group{id: "${params.input.groupId}"})
        MATCH (a: Account)-[:PENDING]->(g)
        WHERE ((g)-[:VOTE_AGAINST{id: "${ctx.user.id}"}]->(a)) OR ((g)-[:VOTE_IN_FAVOUR{id: "${ctx.user.id}"}]->(a))
        CALL{
            MATCH (a)-[vf:VOTE_IN_FAVOUR]->(g)
            RETURN count(vf) as votes_in_favour
        }
        CALL{
            MATCH (a)-[va:VOTE_AGAINST]->(g)
            RETURN count(va) as votes_against
        }
        CALL{
            MATCH (group:Group{id: "${params.input.groupId}"})
            MATCH (a:Account)-[b:BELONGS_TO]->(group)
            RETURN count(a) as group_count
        }
        RETURN {
            user: collect(a),
            votesAgainst: collect(votes_against),
            votesInFavour: collect(votes_in_favour),
            groupCount: collect(group_count)
        } AS result
    `;

    let groupCandidatesResultPayloadList = [];

    let {user, votesAgainst, votesInFavour, groupCount} = await executeQuery<any>(session, groupCandidatesResultQuery, "result");

    user = mapLocationAndGetProperties(user);

    for(let i=0; i<user.length; i++) {
        groupCandidatesResultPayloadList.push({
            "user": user[i],
            "votesAgainst": votesAgainst[i].low,
            "votesInFavour": votesInFavour[i].low,
            "groupCount": groupCount[i].low
        })
    }

    await session.close();

    return groupCandidatesResultPayloadList;
};