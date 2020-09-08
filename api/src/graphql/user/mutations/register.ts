import { ApolloError } from "apollo-server";
import neo4j, { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { hashPassword } from "../../../auth/auth";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    params.userInput.latestLocation = new neo4j.types.Point(
        4326,
        params.userInput.latestLocation.longitude,
        params.userInput.latestLocation.latitude,
    );

    params.userInput.password = await hashPassword(params.userInput.password);

    const findAccountRes = await session.run(
        `
        MATCH (a:Account {email: "${params.userInput.email}"}) return a
        `,
    );

    if (findAccountRes.records.length > 0) {
        throw new ApolloError("This user already exists!", "200", ["This user already exists!"]);
    }

    await session.close();

    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
