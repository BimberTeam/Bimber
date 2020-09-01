import { ApolloError } from "apollo-server";
import neo4j from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { hashPassword } from "../../../auth/auth";

export default async (obj, params, ctx, resolveInfo) => {
    const session = ctx.driver.session();

    params.userInput.location = new neo4j.types.Point(
        4326,
        params.userInput.location.longitude,
        params.userInput.location.latitude,
    );

    params.userInput.password = hashPassword(params.userInput.password);

    const findUserRes = await session.run(
        `
        MATCH (u:User {email: "${params.userInput.email}"}) return u
        `,
    );

    if ( findUserRes.records.length > 0 ) {
        throw new ApolloError("This user already exists!!", "200", ["This user already exists!!"]);
    }

    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
