import fs from "fs";
import ConstraintDirective from "graphql-constraint-directive";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import path from "path";

export const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, "schema.graphql"),
  )
  .toString("utf-8");

const schema = makeAugmentedSchema({
    typeDefs,
});

export { schema };
