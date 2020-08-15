import { makeAugmentedSchema } from "neo4j-graphql-js";
import { Group } from "./group/model";
import { GroupMutations } from "./group/mutations";
import login from "./user/login";
import { User } from "./user/model";
import { UserInputs, UserMutations } from "./user/mutations";
import register from "./user/register";

export const typeDefs = `
  ${User}
  ${Group}

  type Mutation {
    ${UserMutations}
    ${GroupMutations}
  }
  ${UserInputs}
`;

const resolvers = {
  Mutation: {
    login,
    register,
  },
};

const schema = makeAugmentedSchema({
  config: {
    auth: {
      hasRole: false,
      hasScope: false,
      isAuthenticated: true,
    },
  },
  resolvers,
  typeDefs,
});

export { schema };
