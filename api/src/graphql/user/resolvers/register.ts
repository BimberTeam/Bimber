import { singleQuote, debugQuery, accountExist } from './../../common/helper';
import { ApolloError } from "apollo-server";
import neo4j, { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { hashPassword } from "../../../auth/auth";

const emailAlreadyExistsError = singleQuote("Podany email jest zajęty!");

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    params.input.password = await hashPassword(params.input.password);

    if (await accountExist(session, params.input.email) === true) {
        throw new ApolloError(emailAlreadyExistsError, "200", [emailAlreadyExistsError]);
    }

    await session.close();

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
