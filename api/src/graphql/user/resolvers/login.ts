import { singleQuote, executeQuery } from './../../common/helper';
import { ApolloError } from "apollo-server";
import { Session } from "neo4j-driver";
import { verifyPassword } from "../../../auth/auth";
import { createToken } from "../../../auth/auth";

const emailNotFoundError = singleQuote("Podany email nie istnieje!");
const incorrectPassword = singleQuote("Wprowadzono niepoprawne hasło!");
const unexpectedError = singleQuote("Wystąpił niespodziewany błąd!");

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    const findAccount = await session.run(
        `
        MATCH (account:Account {email: "${params.input.email}"}) return account
        `,
    );

    if (findAccount.records.length === 0) {
        throw new ApolloError(emailNotFoundError, "200", [emailNotFoundError]);
    }

    const hashedPassword = findAccount.records[0].get("account").properties.password;

    if (! await verifyPassword(params.input.password, hashedPassword)) {
        throw new ApolloError(incorrectPassword, "200", [incorrectPassword]);
    }

    const account = {
        email: findAccount.records[0].get("account").properties.email,
        id: findAccount.records[0].get("account").properties.id,
    };

    const token = createToken(account.id);

    const setTokenQuery =
        `
        MATCH (account:Account {email: "${params.input.email}"})
        SET account.token = '${token}'
        RETURN true AS result
        `;

    if (!await executeQuery(session, setTokenQuery)) {
        throw new ApolloError(unexpectedError, "200", [unexpectedError]);
    }

    await session.close();

    return {token};
};
