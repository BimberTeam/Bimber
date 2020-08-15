import { ApolloError } from "apollo-server";
import crypto from "crypto";
import neo4j from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    const session = ctx.driver.session();

    params.userInput.location = new neo4j.types.Point(
        4326,
        params.userInput.location.longitude,
        params.userInput.location.latitude,
    );

    params.userInput.password = crypto.createHmac(
        "sha256",
        process.env.HASH_SECRET,
    ).update(params.userInput.password).digest("hex");

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
