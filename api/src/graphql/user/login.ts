import { ApolloError } from "apollo-server";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export default async (obj, params, ctx, resolveInfo) => {
    const session = ctx.driver.session();

    params.password = crypto.createHmac(
        "sha256",
        process.env.HASH_SECRET,
    ).update(params.password).digest("hex");

    const findUserRes = await session.run(
        `
        MATCH (u:User {email: "${params.email}", password:"${params.password}"}) return u
        `,
    );

    if (findUserRes.records.length === 0) {
        throw new ApolloError("Incorrect password or email !", "200", ["Incorrect password or email !"]);
    }

    const token = jwt.sign({email: params.email}, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });
    return token;

};
