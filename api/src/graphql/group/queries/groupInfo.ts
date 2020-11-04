import { ensureAuthorized, debugQuery, singleQuote } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");


const castLocation = (location)  => {
    if (location !== undefined) {
        return {
            "latitude": location['x'],
            "longitude": location['y']
         };
    } else {
        return {
            "latitude": null,
            "longitude": null
         };
    }
}

const mapLocation = (list) =>  {
    return list.map(
        element => {
            element["properties"]['latestLocation'] = castLocation(element["properties"]['latestLocation']);
            return element["properties"];
        });
};

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.id}"})
        RETURN g as result
        `,
    );

    if (doesGroupExist.records.length === 0) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account {id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.id}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    const test = await session.run(
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
            OPTIONAL MATCH (group)<-[:GROUP_INVITATION]-(a:Account)
            RETURN collect(a) AS groupInvitations
        }
        CALL {
            MATCH (group)<-[:BELONGS_TO]-(a:Account)
            RETURN avg(a.age) + 0.000000001 AS averageAge
        }
        CALL {
            MATCH (group)<-[:BELONGS_TO]-(a:Account)
            RETURN count(*) AS groupMembers
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
            WHERE NOT EXISTS( (me)<-[:FRIENDS]-(a:Account) ) AND NOT EXISTS( (me)<-[:PENDING]-(a:Account) ) AND NOT a in [me]
            RETURN collect(a) AS friendsCandidate
        }
        RETURN {
            id: group.id,
            friendsCandidate: friendsCandidate,
            members: members,
            pendingMembers: pendingMembers,
            groupInvitations: groupInvitations,
            averageAge: averageAge,
            groupMembers: groupMembers,
            averageLocation: averageLocation
        } AS result
        `
    )

    await session.close();

    return {
        "id": getValueFromSessionResult(test, "result").id,
        "friendsCandidate": mapLocation(getValueFromSessionResult(test, "result").friendsCandidate),
        "members": mapLocation(getValueFromSessionResult(test, "result").members),
        "pendingMembers": mapLocation(getValueFromSessionResult(test, "result").pendingMembers),
        "groupInvitations": mapLocation(getValueFromSessionResult(test, "result").groupInvitations),
        "averageAge": getValueFromSessionResult(test, "result").averageAge,
        "groupMembers": getValueFromSessionResult(test, "result").groupMembers.low,
        "averageLocation": getValueFromSessionResult(test, "result").averageLocation
    }
};
