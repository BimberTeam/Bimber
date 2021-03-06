import { ApolloError } from "apollo-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface TokenInfo {
    id: string;
}

export const createToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });
};

export const verifyToken = (token: string): TokenInfo => {
    let decodedAccount;
    if (!token || token === "null") { return null; }
    try {
        decodedAccount = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        throw new ApolloError("Invalid token", "401", ["Token is invalid!"]);
    }
    return decodedAccount;
};

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const retrieveToken = (req, connection): string => {
   const token = connection?.context?.Authorization 
   || connection?.context?.headers?.Authorization 
   || connection?.context?.token 
   || req?.headers?.authorization 
   || "";
   return token;
};
