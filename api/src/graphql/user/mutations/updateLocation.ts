import { executeQuery, singleQuote } from './../../common/helper';
import { ensureAuthorized } from '../../common/helper';
import { Session } from "neo4j-driver";

export const updatedLocationSuccess = singleQuote("Zaktualizowano lokalizacje!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    const updateLocationQuery: string = `
        MATCH (a:Account {id: "${ctx.user.id}"})-[:OWNER]-(g:Group)
        WITH point({longitude: ${params.input.longitude+0.000001}, latitude: ${params.input.latitude+0.000001}}) as avgLocation, a, g
        SET g.avgLocation = avgLocation
        SET a.latestLocation = avgLocation
        RETURN "Updated location" as result
    `;
    await executeQuery<string>(session, updateLocationQuery);

    const getGroupsQuery: string = `
        MATCH (a:Account {id: "${ctx.user.id}"})-[:BELONGS_TO]-(g:Group)
        RETURN collect(g) as result
    `;
    const groups:[] = await executeQuery(session, getGroupsQuery);

    for(const group of groups) {
        console.log(group["properties"]["id"]);
        const setGroupAverageLocation: string = `
            MATCH (a: Account)-[:BELONGS_TO]->(g:Group {id: "${group["properties"]["id"]}"})
            WITH point({
                longitude: avg(a.latestLocation.longitude) + 0.000000001 ,
                latitude: avg(a.latestLocation.latitude) + 0.000000001
            }) as avgLocation, g
            SET g.avgLocation = avgLocation
            RETURN avgLocation as result
        `;
        console.log(await executeQuery<string>(session, setGroupAverageLocation));
    }

    await session.close();
    return {status: 'OK', message: updatedLocationSuccess};
};
