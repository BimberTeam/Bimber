import { GraphQLScalarType, Kind} from "graphql";

export const DateScalar = new GraphQLScalarType({
    name: "BimberDate",
    description: "Date compatible with ISO 8601",
    serialize(value) {
        return new Date(value); 
    },
    parseValue(value) {
        return value.getTime(); 
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10);
        }
        return null;
    }
});
