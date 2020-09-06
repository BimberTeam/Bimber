import { ApolloError } from "apollo-server";
import { Session } from "neo4j-driver";
import { verifyPassword } from "../../../auth/auth";
import { createToken } from "../../../auth/auth";
import { getValueFromSessionResult } from "./../../utils/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    const findUser = await session.run(
        `
        MATCH (user:User {email: "${params.email}"}) return user
        `,
    );

    if (findUser.records.length === 0) {
        throw new ApolloError("Incorrect Email !", "200", ["Incorrect Email !"]);
    }

    const hashedPassword = findUser.records[0].get("user").properties.password;

    if (!verifyPassword(params.password, hashedPassword)) {
        throw new ApolloError("Incorrect Password !", "200", ["Incorrect Password !"]);
    }

    const user = {
        email: findUser.records[0].get("user").properties.email,
        id: findUser.records[0].get("user").properties.id,
    };

    const token = createToken(user.email, user.id);

    const setToken = await session.run(
        `
        MATCH (user:User {email: "${params.email}"})
        SET user.token = '${token}'
        return 'ok' AS result
        `,
    );

    if (getValueFromSessionResult(setToken, "result") !== "ok") {
        throw new ApolloError("Unexpected Error !", "200", ["Unexpected Error!"]);
    }

    return token;
};
