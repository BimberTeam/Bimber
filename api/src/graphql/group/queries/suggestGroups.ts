import { mapLocationAndGetProperties } from '../common/helper';
import { Session } from 'neo4j-driver';
import { executeQuery, ensureAuthorized} from '../../common/helper';

function startTimer() {
    return process.hrtime(); 
}

function endTimer(startTime) {
    return process.hrtime(startTime);
}

function log(prefix, elapsedTime: [number, number]) {
    console.info(`${prefix}: %ds %dms`, elapsedTime[0], elapsedTime[1] / 1000000);
}

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
    const getGroupAlcoholPreferenceQuery = `
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

    return await executeQuery<string>(session, getGroupAlcoholPreferenceQuery);
};

const getGroupProperties = async (groupId: string, session: Session): Promise<any> => {
    const getGroupPropertiesQuery: string = `
        MATCH(g:Group{id:"${groupId}"})-[:OWNER|:BELONGS_TO]-(members:Account)
        RETURN  {
            id: g.id,
            members: collect(members),
            averageLocation: {
                longitude: avg(members.latestLocation.longitude) + 0.000000001 ,
                latitude: avg(members.latestLocation.latitude) + 0.000000001
            },
            averageAge: avg(members.age) + 0.000000001
        } as result
    `;

    let groupProperties: any = await executeQuery<any>(session, getGroupPropertiesQuery);
    groupProperties.members = mapLocationAndGetProperties(groupProperties.members);
    return groupProperties;
}

const getGroupsAttributes = async (session: Session, groupsIds: any[]): Promise<any[]> => {
    const start = startTimer();
    const groups: any[] = [];
    for(const group of groupsIds) {
        groups.push(await getGroupProperties(group.id, session));
    };
    const end = endTimer(start);
    log("GetGroupsAttributes", end);
    return groups;
}

const isSame = (A: string, B: string): number => {
    return A === B ? 0 : 1;
};

const isGroupInAgePreferenceRange = (groupAge: number, me: {agePreferenceFrom: any, agePreferenceTo: any}): number => {
    return groupAge >= me.agePreferenceFrom && groupAge <= me.agePreferenceTo ? 0 : 1;
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

    const listGenesisGroupsOfSwipesOnMeQuery: string = `
        MATCH (me:Account{id: "${ctx.user.id}"})-[:OWNER]-(meGroup:Group)
        MATCH (a:Account)-[:PENDING]->(meGroup)
        MATCH (groups:Group)-[:OWNER]-(a)
        WHERE NOT EXISTS((me)-[:DISLIKE]-(groups))
        RETURN collect(groups) as result
    `;
    
    let start: [number, number];
    let end: [number, number];

    start = startTimer();
    let swipedGroups: any = await <any>executeQuery(session, listGenesisGroupsOfSwipesOnMeQuery);
    end = endTimer(start);
    log("Swiped groups", end);

    swipedGroups = swipedGroups.map(group => group['properties']);

    if(swipedGroups.length >= params.input.limit) {
        return getGroupsAttributes(session, swipedGroups);
    }

    suggestionGroups = suggestionGroups.concat(swipedGroups);
    params.input.limit -= swipedGroups.length;
    
    start = startTimer();

    const getNearestGroupQuery: any = await session.run(`
        MATCH (me:Account{id: "${ctx.user.id}"})-[:OWNER]-(meGroup:Group)
        MATCH (a:Account)-[:OWNER|:BELONGS_TO]-(groups:Group)
        WHERE NOT EXISTS((me)-[:DISLIKE]-(groups)) AND NOT EXISTS((me)-[:OWNER|:BELONGS_TO|:PENDING]-(groups)) AND NOT EXISTS((a)-[:PENDING]-(meGroup))
        MATCH (members:Account)-[:OWNER|:BELONGS_TO]->(groups)
        WITH distance(groups.avgLocation, me.latestLocation) as dist, groups, count(members) as countMembers
        WHERE dist < toInteger(${params.input.range})
        RETURN collect({
            id: groups.id,
            distance: dist,
            countMembers: countMembers
        }) as result, dist
        ORDER BY dist
        LIMIT ${params.input.limit+5}
    `);
    
    end = endTimer(start);
    log("GetNearestGroupQuery", end);

    let nearestGroup:any[] = [];

    for(const record of getNearestGroupQuery.records) {
        for(const group of record.get("result")) {
            if(group.countMembers == 1) {
                start = startTimer();
                const listOfGroupsUserAndMeBelongs: any = await session.run(`
                    MATCH (me:Account{id: "${ctx.user.id}"})
                    MATCH (g: Group{id: "${group.id}"})<-[:OWNER]-(a:Account)
                    OPTIONAL MATCH (a)-[:BELONGS_TO]->(groups:Group)<-[:BELONGS_TO]-(me)
                    RETURN {
                        id: groups.id
                    } as result
                `);
                end = endTimer(start);
                log("ListOfGroupsUserAndMeBelongs", end);

                if(listOfGroupsUserAndMeBelongs.records.length == 0) {
                    nearestGroup.push(group);
                    continue;
                }

                let meBelongsToGroup: boolean = false;
                start = startTimer();
                for(const record of  listOfGroupsUserAndMeBelongs.records) {
                    const {id: groupId} = record.get("result");
                        const meBelongsToGroupQuery: string = `
                            MATCH (me:Account{id: "${ctx.user.id}"})
                            OPTIONAL MATCH (g:Group{id: "${groupId}"})-[:BELONGS_TO]-(members:Account)
                            RETURN count(members) = 2 AND me in collect(members) as result
                        `;

                        if(await executeQuery<boolean>(session, meBelongsToGroupQuery)) {
                            meBelongsToGroup = true;
                        }
                };
                end = endTimer(start);
                log(`MeBelongsToGroupQuery * ${listOfGroupsUserAndMeBelongs.records.length}`, end);


                if(!meBelongsToGroup) nearestGroup.push(group);

            } else {
                nearestGroup.push(group);
            }
        }
    }

    if (nearestGroup.length === 0 || nearestGroup.length <= params.input.limit) {
        return getGroupsAttributes(session, suggestionGroups.concat(nearestGroup));
    };

    start = startTimer();
    for(const group of nearestGroup) {
        group["priority"] = (0.55 * group.distance / params.input.range) +
                            (0.15 * isSame(await getGroupGender(group.id, session), me.genderPreference)) +
                            (0.15 * isSame(await getGroupAlcoholPreference(group.id, session), me.alcoholPreference)) +
                            (0.15 * isGroupInAgePreferenceRange(await getGroupAverageAge(group.id, session), me));
    };
    end = endTimer(start);
    
    log("Priorities of nearestGroups", end);

    nearestGroup.sort((groupA, groupB) => groupA.priority - groupB.priority);
    suggestionGroups = suggestionGroups.concat(nearestGroup.slice(0, params.input.limit));

    const groups: any[] = [];
    start = startTimer();
    for(const group of suggestionGroups) {
        groups.push(await getGroupProperties(group.id, session));
    };
    end = endTimer(start);
    log("SuggestionGroups properties", end);


    return groups;
};