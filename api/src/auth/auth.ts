import { ApolloError } from "apollo-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface TokenInfo {
    email: string;
    id: { low: number, high: number };
    iat: number;
    exp: number;
}

export const createToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });
};

export const verifyToken = (token: string): TokenInfo => {
    let decodedAccount;
    if (!token) { return null; }
    try {
        decodedAccount = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        throw new ApolloError("Invalid token", "401", ["Token is invalid!"]);
    }
    return decodedAccount;
};

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS, 10));
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const retrieveToken = (req, connection): string => {
    if (connection) {
        return connection.context.token;
    }
    const token = req.headers.authorization || "";
    return token;
};
