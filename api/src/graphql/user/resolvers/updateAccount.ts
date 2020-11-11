import { debugQuery, singleQuote, ensureAuthorized, accountExists } from './../../common/helper';
import { ApolloError } from "apollo-server";
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const emailAlreadyExistsError = singleQuote("Podany email już istnieje !");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (params.input.email !== undefined) {

        if (await accountExists(session, params.input.email)) {
            throw new ApolloError(emailAlreadyExistsError, "200", [emailAlreadyExistsError]);
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
