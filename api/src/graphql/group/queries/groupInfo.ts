import { ensureAuthorized, singleQuote, groupExists, userBelongsToGroup } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Point, Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

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

    if (await groupExists(session, params.id) === false) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (await userBelongsToGroup(session, params.id, ctx.user.id) === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    const getGroupInfo = await session.run(
        `
        MATCH(group: Group {id: "${params.id}"})
        MATCH(me: Account {id: "${ctx.user.id}"})
        CALL {
            MATCH (group)<-[:BELONGS_TO]-(a:Account)
            RETURN collect(a) AS members
        }
        CALL {
            OPTIONAL MATCH (group)<-[:PENDING]-(a:Account)
            RETURN collect(a) AS pendingMembers
        }
        CALL {
            MATCH (group)<-[:BELONGS_TO]-(a:Account)
            RETURN avg(a.age) + 0.000000001 AS averageAge
        }
        CALL {
            MATCH (group)<-[:BELONGS_TO]-(a:Account)
            RETURN {
                longitude: avg(a.latestLocation.longitude) + 0.000000001 ,
                latitude: avg(a.latestLocation.latitude) + 0.000000001
            } AS averageLocation
        }
        CALL {
            WITH me
            MATCH (group)<-[:BELONGS_TO]-(a:Account)
            WHERE NOT EXISTS( (me)<-[:FRIENDS]-(a:Account) ) AND NOT EXISTS( (me)<-[:REQUESTED_FRIENDS]-(a:Account) ) AND NOT a in [me]
            RETURN collect(a) AS friendCandidates
        }
        RETURN {
            id: group.id,
            friendCandidates: friendCandidates,
            members: members,
            pendingMembers: pendingMembers,
            averageAge: averageAge,
            averageLocation: averageLocation
        } AS result
        `
    )

    const {id, friendCandidates, members, pendingMembers, averageAge, averageLocation} = getValueFromSessionResult(getGroupInfo, "result");

    await session.close();
    return {
        "id": id,
        "friendCandidates": mapLocationAndGetProperties(friendCandidates),
        "members": mapLocationAndGetProperties(members),
        "pendingMembers": mapLocationAndGetProperties(pendingMembers),
        "averageAge": averageAge,
        "averageLocation": averageLocation
    }
};
