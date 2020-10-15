import { ApolloError } from "apollo-server"

const notAuthorized = "'Jesteś niautoryzowany do wykonania tej operacji!'";

export const getValueFromSessionResult = (sessionResult, key: string) => {
    return sessionResult.records[0].get(key);
};

export const ensureAuthorized = (ctx) => {
    if (ctx.user === null) {
        throw new ApolloError(notAuthorized, "405", [notAuthorized]);
    }
}

export const singleQuote = (string: String) => { return `'${string}'` }
