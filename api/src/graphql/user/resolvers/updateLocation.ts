import {debugQuery, ensureAuthorized } from './../../common/helper';
import neo4j, { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (params.input) {
        params.location = new neo4j.types.Point(
        // magic number info : https://neo4j.com/docs/cypher-manual/current/functions/spatial/#functions-point-wgs84-2d
            4326,
            params.input.longitude + 0.000001,
            params.input.latitude + 0.000001,
        );
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
