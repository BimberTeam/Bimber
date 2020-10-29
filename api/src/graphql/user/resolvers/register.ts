import { singleQuote, debugQuery } from './../../common/helper';
import { ApolloError } from "apollo-server";
import neo4j, { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { hashPassword } from "../../../auth/auth";

const emailAlreadyExistsError = singleQuote("Podany email jest zajęty!");

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    if (params.input.latestLocation) {
        params.input.latestLocation = new neo4j.types.Point(
        // magic number info : https://neo4j.com/docs/cypher-manual/current/functions/spatial/#functions-point-wgs84-2d
            4326,
            params.input.latestLocation.longitude,
            params.input.latestLocation.latitude,
        );
    }


    params.input.password = await hashPassword(params.input.password);

    const findAccount = await session.run(
        `
        MATCH (a:Account {email: "${params.input.email}"}) return a
        `,
    );

    if (findAccount.records.length > 0) {
        throw new ApolloError(emailAlreadyExistsError, "200", [emailAlreadyExistsError]);
    }

    await session.close();

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
