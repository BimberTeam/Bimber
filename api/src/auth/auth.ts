import { ApolloError } from "apollo-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Integer } from "neo4j-driver";

interface ITokenInfo {
    email: string;
    id: { low: Integer, high: Integer };
    iat: Integer;
    exp: Integer;
}

export const createToken = (email: string, id: string): string => {
    return jwt.sign({ email, id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });
};

export const verifyToken = (token: string): ITokenInfo => {
    let decodedUser;
    if (!token) { return null; }
    try {
        decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        throw new ApolloError("Invalid token", "401", ["Token is invalid!"]);
    }
    return decodedUser;
};

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS, 10));
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const checkToken = (req, connection): string => {
    if (connection) {
        return connection.context.token;
    }
    const token = req.headers.authorization || "";
    return token;
};
