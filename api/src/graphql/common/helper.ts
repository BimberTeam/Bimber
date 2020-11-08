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

    if(accountTokenResult.records.length === 0 ) {
        throw new ApolloError(notAuthorized, "401", [notAuthorized]);
    }

    const accountToken: string = getValueFromSessionResult(accountTokenResult, 'result');

    if(accountToken !== ctx.token) {
        throw new ApolloError(notAuthorized, "401", [notAuthorized]);
    }
};

export const debugQuery = (): boolean => {
    return (process.env.DEBUG_NEO4J_QUERY === "true");
}

export const userExists = async (session: Session, userID: string): Promise<boolean> => {
    const userExistss = await session.run(
        `
        MATCH (a: Account{id: "${userID}"})
        RETURN a
        `,
    );

    if (userExistss.records.length === 0) {
        return false;
    }
    return true;
}

export const groupExists = async (session: Session, groupId: string): Promise<boolean> => {
    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${groupId}"})
        RETURN g
        `,
    );

    if (doesGroupExist.records.length === 0) {
        return false;
    }
    return true;
}

export const userBelongsToGroup = async (session: Session, groupId: string, userId: string): Promise<boolean> => {
    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account {id: "${userId}"})
        MATCH (g: Group{id: "${groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
       return false;
    }
    return true;
}

export const groupInvitationExist = async (session: Session, groupId: string, userId: string): Promise<boolean> => {
    const groupInvitationExist = await session.run(
        `
        MATCH (a: Account{id: "${userId}"})
        MATCH (g: Group{id: "${groupId}"})
        RETURN EXISTS( (a)-[:GROUP_INVITATION]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(groupInvitationExist, "result") === false) {
        return false;
    }
    return true;
}

export const friendshipExist = async (session: Session, meID: string, friendId: string): Promise<boolean> => {
    const friendshipExist = await session.run(
        `
        MATCH (me: Account{id: "${meID}"})
        MATCH (a: Account{id: "${friendId}"})
        RETURN EXISTS( (a)-[:FRIENDS]-(me) ) as result
        `,
    );

    if (getValueFromSessionResult(friendshipExist, "result") === false) {
        return false;
    }
    return true;
}

export const accountExists = async (session: Session, email: string): Promise<boolean> => {
    const findAccount = await session.run(
        `
        OPTIONAL MATCH (account:Account {email: "${email}"})
        RETURN account IS NULL AS result
        `,
    );

    if (getValueFromSessionResult(findAccount, "result") === true) {
        return false;
    }
    return true;
}