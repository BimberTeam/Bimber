import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import express from "express";
import neo4j from "neo4j-driver";
import { checkToken, verifyToken } from "./auth/auth";
import { initializeDatabase } from "./database/initialize";
import { schema } from "./graphql/schema";

const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "letmein",
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? "ENCRYPTION_ON" : "ENCRYPTION_OFF",
  },
);

dotenv.config();

const app = express();

initializeDatabase(driver);

const server = new ApolloServer({
  context: ({ req, connection }) => {
    const token = checkToken(req, connection);
    const user = verifyToken(token);
    return {
      driver,
      req,
      user,
    };
  },
  introspection: true,
  playground: true,
  schema,
});

const port = process.env.GRAPHQL_SERVER_PORT || 4001;
const path = process.env.GRAPHQL_SERVER_PATH || "/graphql";
const host = process.env.GRAPHQL_SERVER_HOST || "0.0.0.0";

server.applyMiddleware({ app, path });

app.listen({ host, port, path }, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`);
});
