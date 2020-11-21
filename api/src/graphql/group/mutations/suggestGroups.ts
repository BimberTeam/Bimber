import { Session } from 'neo4j-driver';
import { executeQuery, ensureAuthorized} from './../../common/helper';

const getGroupGender = async (groupId: string, session: Session): Promise<string> => {
    const getGroupGenderQuery = `
        CALL { MATCH (g:Group{id:"${groupId}"})-[:BELONGS_TO|:OWNER]-(members:Account{gender: "FEMALE"}) RETURN count(members) as female }
        CALL { MATCH (g:Group{id:"${groupId}"})-[:BELONGS_TO|:OWNER]-(members:Account{gender: "FEMALE"}) RETURN count(members) as male }
        CALL apoc.when(
            male >= female,
            \"
                RETURN 'MALE' AS result
            \",
            \"
                RETURN 'FEMALE' AS result
            \",
            {male:male, female:female}
        ) YIELD value
        RETURN value.result as result
    `;

    return await executeQuery<string>(session, getGroupGenderQuery);
};

const getGroupAverageAge = async (groupId: string, session: Session): Promise<number> => {
    const getGroupAverageAgeQuery = `
        MATCH (g:Group{id:"${groupId}"})-[:BELONGS_TO|:OWNER]-(members:Account)
        RETURN avg(members.age) as result
    `;

    return await executeQuery<number>(session, getGroupAverageAgeQuery);
}

const getGroupAlcoholPreference = async (groupId: string, session: Session): Promise<string> => {
    const getDominatingGenderQuery = `
        CALL {
            MATCH(g:Group{id:"${groupId}"})-[:OWNER|:BELONGS_TO]-(members:Account{alcoholPreference: "VODKA"})
            RETURN count(members) as number, "VODKA" as result
            UNION ALL
            MATCH(g:Group{id:"${groupId}"})-[:OWNER|:BELONGS_TO]-(members:Account{alcoholPreference: "BEER"})
            RETURN count(members) as number, "BEER" as result
            UNION ALL
            MATCH(g:Group{id:"${groupId}"})-[:OWNER|:BELONGS_TO]-(members:Account{alcoholPreference: "WINE"})
            RETURN count(members) as number, "WINE" as result
            UNION ALL
            MATCH(g:Group{id:"${groupId}"})-[:OWNER|:BELONGS_TO]-(members:Account{alcoholPreference: "OTHER"})
            RETURN count(members) as number , "OTHER" as result
        }
        RETURN result, number ORDER BY(number) desc
    `;

    return await executeQuery<string>(session, getDominatingGenderQuery);
};

const compareProperty = (groupProperty: string, mePreference: string): number => {
    return groupProperty === mePreference ? 0 : 1;
};

const ageCompatibility = (groupAge: number, me:any): number => {
    return groupAge >= me.agePreferenceFrom.low && groupAge <= me.agePreferenceTo.low ? 0 : 1;
}

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    let suggestionGroups = [];

    const meQuery: string = `
        MATCH (a:Account{id: "${ctx.user.id}"})
        RETURN a as result
    `;

    const {properties: me}: any = await executeQuery<any>(session, meQuery);

    const getGroupsSwipedToYouQuery: string = `
        MATCH (me:Account{id: "${ctx.user.id}"})-[:OWNER]-(meGroup:Group)
        MATCH (a:Account)-[:PENDING]->(meGroup)
        MATCH (groups:Group)-[:OWNER]-(a)
        WHERE NOT EXISTS((me)-[:DISLIKE]-(groups))
        RETURN collect(groups) as result
    `;

    let swipedGroups: any = await <any>executeQuery(session, getGroupsSwipedToYouQuery);
    swipedGroups = swipedGroups.map(group => group['properties']);

    if(swipedGroups.length >= params.input.limit) {
        return swipedGroups;
    }

    suggestionGroups = suggestionGroups.concat(swipedGroups);
    params.input.params -= swipedGroups.length;

    const getNearestGroupQuery: any = await session.run(`
        MATCH (me:Account{id: "${ctx.user.id}"})-[:OWNER]-(meGroup:Group)
        MATCH (a:Account)-[:OWNER]-(groups:Group)
        WHERE NOT EXISTS((me)-[:DISLIKE]-(groups)) AND NOT EXISTS((me)-[:OWNER]-(groups)) AND NOT EXISTS((a)-[:PENDING]-(meGroup))
        MATCH (members:Account)-[:OWNER]->(groups)
        WITH groups,
             point({longitude: avg(members.latestLocation.longitude), latitude: avg(members.latestLocation.latitude)}) as averageLocation,
             me.latestLocation as meLocation
        WITH distance(averageLocation, meLocation) as dist, groups
        WHERE dist < toInteger(${params.input.range})
        RETURN collect({
            id: groups.id,
            distance: dist
        }) as result, dist
        ORDER BY dist DESC
    `);

    const nearestGroup:Array<any> = [];

    getNearestGroupQuery.records.forEach(
        record => record.get("result").forEach(group => nearestGroup.push(group))
    );

    if (nearestGroup.length === 0 || nearestGroup.length <= params.input.limit) {
        return suggestionGroups.concat(nearestGroup);
    };

    for(const group of nearestGroup) {
        group["priority"] = (0.55 * group.distance / params.input.range) +
                            (0.15 * compareProperty(await getGroupGender(group.id, session), me.genderPreference)) +
                            (0.15 * compareProperty(await getGroupAlcoholPreference(group.id, session), me.alcoholPreference)) +
                            (0.15 * ageCompatibility(await getGroupAverageAge(group.id, session), me))
    };

    nearestGroup.sort((groupA, groupB) => groupB.priority - groupA.priority);

    nearestGroup.map(group => {
        delete group.distance;
        delete group.priority;
        return group;
    });

    suggestionGroups = suggestionGroups.concat(nearestGroup.slice(0, params.input.limit - 1));
    return suggestionGroups;
};