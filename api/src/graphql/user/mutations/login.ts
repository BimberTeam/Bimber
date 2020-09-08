import { ApolloError } from "apollo-server";
import { Session } from "neo4j-driver";
import { verifyPassword } from "../../../auth/auth";
import { createToken } from "../../../auth/auth";
import { getValueFromSessionResult } from "./../../utils/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    const findAccount = await session.run(
        `
        MATCH (account:Account {email: "${params.email}"}) return account
        `,
    );

    if (findAccount.records.length === 0) {
        throw new ApolloError("Incorrect Email !", "200", ["Incorrect Email !"]);
    }

    const hashedPassword = findAccount.records[0].get("account").properties.password;

    if (!verifyPassword(params.password, hashedPassword)) {
        throw new ApolloError("Incorrect Password !", "200", ["Incorrect Password !"]);
    }

    const account = {
        email: findAccount.records[0].get("account").properties.email,
        id: findAccount.records[0].get("account").properties.id,
    };

    const token = createToken(account.id);

    const setToken = await session.run(
        `
        MATCH (account:Account {email: "${params.email}"})
        SET account.token = '${token}'
        return 'ok' AS result
        `,
    );

    if (getValueFromSessionResult(setToken, "result") !== "ok") {
        throw new ApolloError("Unexpected Error !", "200", ["Unexpected Error!"]);
    }
    await session.close();

    return token;
};
