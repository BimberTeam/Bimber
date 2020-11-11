import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";

export const singleQuote = (string: String) => { return `'${string}'` }

const notAuthorized = singleQuote("unauthorized");
const unexpectedError = singleQuote("Wystąpił niespodziewany błąd podczas wywoływania Query!");

export interface Message {
    status: string,
    message: string
}

export const executeQuery = async <T>(session: Session, query: string, key: string = "result"): Promise<T> => {
    const queryResult = await session.run(query);

    if (queryResult.records.length === 0) {
        throw new ApolloError(unexpectedError, "400", [unexpectedError]);
    }

    return queryResult.records[0].get(key);
}

export const ensureAuthorized = async (ctx) => {

    if (ctx.user === null) {
        throw new ApolloError(notAuthorized, "401", [notAuthorized]);
    }

    const session: Session = ctx.driver.session();

    const accountTokenResultQuery =
        `
        MATCH (a: Account{id: "${ctx.user.id}"})
        RETURN a.token as result
        `;

    const accountToken: string = await executeQuery<string>(session, accountTokenResultQuery);

    if (accountToken !== ctx.token) {
        throw new ApolloError(notAuthorized, "401", [notAuthorized]);
    }
};

export const debugQuery = (): boolean => {
    return (process.env.DEBUG_NEO4J_QUERY === "true");
}

export const userExists = async (session: Session, userID: string): Promise<boolean> => {
    const userExistsQuery =
        `
        OPTIONAL MATCH (a: Account{id: "${userID}"})
        RETURN a IS NULL AS result
        `;

    return await executeQuery<boolean>(session, userExistsQuery) !== true;
}

export const groupExists = async (session: Session, groupId: string): Promise<boolean> => {
    const doesGroupExistQuery =
        `
        OPTIONAL MATCH (g: Group{id: "${groupId}"})
        RETURN g IS NULL AS result
        `;

    return await executeQuery<boolean>(session, doesGroupExistQuery) !== true;
}

export const userBelongsToGroup = async (session: Session, groupId: string, userId: string): Promise<boolean> => {
    const userBelongsToGroupQuery =
        `
        MATCH (a: Account {id: "${userId}"})
        MATCH (g: Group{id: "${groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `;

    return await executeQuery<boolean>(session, userBelongsToGroupQuery) !== false;
}

export const groupInvitationExist = async (session: Session, groupId: string, userId: string): Promise<boolean> => {
    const groupInvitationExistQuery =
        `
        MATCH (a: Account{id: "${userId}"})
        MATCH (g: Group{id: "${groupId}"})
        RETURN EXISTS( (a)-[:GROUP_INVITATION]-(g) ) as result
        `;

    return await executeQuery<boolean>(session, groupInvitationExistQuery) !== false;
}

export const friendshipExist = async (session: Session, meID: string, friendId: string): Promise<boolean> => {
    const friendshipExistQuery =
        `
        MATCH (me: Account{id: "${meID}"})
        MATCH (a: Account{id: "${friendId}"})
        RETURN EXISTS( (a)-[:FRIENDS]-(me) ) as result
        `;

    return await executeQuery<boolean>(session, friendshipExistQuery) !== false;
}

export const accountExists = async (session: Session, email: string): Promise<boolean> => {
    const accountExistsQuery =
        `
        OPTIONAL MATCH (account:Account {email: "${email}"})
        RETURN account IS NULL AS result
        `;

    return await executeQuery<boolean>(session, accountExistsQuery) !== true;
}

export const userAlreadyPendingToGroup = async (session: Session, groupId: string, userId: string): Promise<boolean>  => {
    const userAlreadyPendingToGroupQuery = `
        MATCH (group: Group {id: "${groupId}"})
        MATCH (me:Account {id: "${userId}"})
        RETURN EXISTS( (me)-[:PENDING]->(group) ) AS result
    `;

    return await executeQuery<boolean>(session, userAlreadyPendingToGroupQuery) === true;
}