import { ApolloError } from "apollo-server";
import { hashPassword } from "../../../auth/auth";
import { createToken } from "../../../auth/auth";
import { getValueFromSessionResult } from "./../../utils/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session = ctx.driver.session();
    params.password = hashPassword(params.password);

    const findUser = await session.run(
        `
        MATCH (user:User {email: "${params.email}", password:"${params.password}"}) return user
        `,
    );

    if (findUser.records.length === 0) {
        throw new ApolloError("Incorrect password or email !", "200", ["Incorrect password or email !"]);
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
