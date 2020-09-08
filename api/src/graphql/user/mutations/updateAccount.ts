import { ApolloError } from "apollo-server";
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    if (params.account.email) {
        const findAccountRes = await session.run(
            `
            MATCH (a:Account {email: "${params.account.email}"}) return a
            `,
        );

        if (findAccountRes.records.length > 0) {
            throw new ApolloError("This email is not unique!", "200", ["This email is not unique!"]);
        }

        await session.close();
    }

    let keys: string[] = [];
    let values: any[] = [];

    for (let param in params.account) {
        keys.push(param);
        values.push(params.account[param]);
    }

    params.keys = keys;
    params.values = values;
    params.meId = ctx.user.id.low;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
