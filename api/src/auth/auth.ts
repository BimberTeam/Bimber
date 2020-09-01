import { ApolloError } from "apollo-server";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const createToken = (email: string, id: string) => {
    return jwt.sign({email, id}, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });
};

export const verifyToken = (token: string) => {
    let decodedUser;
    if (token) {
        try {
            decodedUser = jwt.verify(token, process.env.JWT_SECRET);
          } catch (e) {
            throw new ApolloError("Invalid token", "401", ["Token is invalid!"]);
        }
        return decodedUser;
    } else {
        return null;
    }
};

export const hashPassword = (password: string) => {
    return crypto.createHmac(
        "sha256",
        process.env.HASH_SECRET,
    ).update(password).digest("hex");
};

export const checkToken  = (req, connection) => {
    if (connection) {
        return connection.context.token;
    }
    const token = req.headers.authorization || "";
    return token;
};
