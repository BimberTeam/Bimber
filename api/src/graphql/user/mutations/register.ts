import { ApolloError } from "apollo-server";
import neo4j, { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { hashPassword } from "../../../auth/auth";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    params.user.latestLocation = new neo4j.types.Point(
    // magic number info : https://neo4j.com/docs/cypher-manual/current/functions/spatial/#functions-point-wgs84-2d
        4326,
        params.user.latestLocation.longitude,
        params.user.latestLocation.latitude,
    );

    params.user.password = await hashPassword(params.user.password);

    const findAccountRes = await session.run(
        `
        MATCH (a:Account {email: "${params.user.email}"}) return a
        `,
    );

    if (findAccountRes.records.length > 0) {
        throw new ApolloError("This user already exists!", "200", ["This user already exists!"]);
    }

    await session.close();

    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
