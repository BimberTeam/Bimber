import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import express from "express";
import { driver } from "./database/config";
import { initializeDatabase } from "./database/initialize";
import { schema } from "./graphql/schema";

dotenv.config();

const app = express();

const init = async (driver) => {
  await initializeDatabase(driver);
};

init(driver);

const server = new ApolloServer({
  context: ({ req }) => {
    return {
      driver,
      req,
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
