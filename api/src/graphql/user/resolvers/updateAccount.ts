import { debugQuery, singleQuote } from './../../common/helper';
import { ApolloError } from "apollo-server";
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const emailNotUniqueError = singleQuote("Podany email już istnieje !");

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    if (params.input.email !== undefined) {
        const findAccount = await session.run(
            `
            MATCH (a:Account {email: "${params.input.email}"}) return a
            `,
        );

        if (findAccount.records.length > 0) {
            throw new ApolloError(emailNotUniqueError, "200", [emailNotUniqueError]);
        }

        await session.close();
    }

    let keys: string[] = [];
    let values: any[] = [];

    for (let param in params.input) {
        keys.push(param);
        values.push(params.input[param]);
    }

    params.keys = keys;
    params.values = values;
    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
