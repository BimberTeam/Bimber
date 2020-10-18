import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";

export const singleQuote = (string: String) => { return `'${string}'` }

const notAuthorized = singleQuote("unauthorized");

export const getValueFromSessionResult = (sessionResult, key: string) => {
    return sessionResult.records[0].get(key);
};

export const ensureAuthorized = async (ctx) => {

    if (ctx.user === null) {
        throw new ApolloError(notAuthorized, "401", [notAuthorized]);
    }

    const session: Session = ctx.driver.session();

    const accountTokenResult = await session.run(
        `
        MATCH (a: Account{id: "${ctx.user.id}"})
        RETURN a.token as result
        `,
    );

    const accountToken: string = getValueFromSessionResult(accountTokenResult, 'result');

    if(accountToken !== ctx.token) {
        throw new ApolloError(notAuthorized, "401", [notAuthorized]);
    }
};

