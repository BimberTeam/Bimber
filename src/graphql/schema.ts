import ConstraintDirective from "graphql-constraint-directive";
import { makeExecutableSchema } from "graphql-tools";
import { typeDefs } from "../graphql/typeDefs";

const schema = makeExecutableSchema({
    schemaDirectives: { constraint: ConstraintDirective }, typeDefs,
});

export { schema };
