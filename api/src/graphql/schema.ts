import { makeAugmentedSchema } from "neo4j-graphql-js";
import { neo4jgraphql } from "neo4j-graphql-js";
import { Group } from "./group/model";
import { GroupMutations } from "./group/mutations/mutations";
import swipe from "./group/mutations/swipe";
import { GroupQueries } from "./group/queries";
import { UserInputs } from "./user/inputs";
import { User } from "./user/model";
import login from "./user/mutations/login";
import { UserMutations } from "./user/mutations/mutations";
import register from "./user/mutations/register";
import { UserQueries } from "./user/queries";
import getUserInfoFromContex from "./utils/getUserInfoFromContex";

export const typeDefs = `
  ${User}
  ${Group}

  type Query {
    ${UserQueries}
    ${GroupQueries}
  }

  type Mutation {
    ${UserMutations}
    ${GroupMutations}
  }

  ${UserInputs}
`;

const resolvers = {
  Mutation: {
    login,
    me(object, params, ctx, resolveInfo) {
      return getUserInfoFromContex(object, params, ctx, resolveInfo);
    },
    friendRequest(object, params, ctx, resolveInfo) {
      return getUserInfoFromContex(object, params, ctx, resolveInfo);
    },
    removeFriend(object, params, ctx, resolveInfo) {
      return getUserInfoFromContex(object, params, ctx, resolveInfo);
    },
    sendFriendRequest(object, params, ctx, resolveInfo) {
      return getUserInfoFromContex(object, params, ctx, resolveInfo);
    },
    cancelFriendRequest(object, params, ctx, resolveInfo) {
      return getUserInfoFromContex(object, params, ctx, resolveInfo);
    },
    register,
    swipe,
  },
  Query: {
    user(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
    group(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
  },
};

const schema = makeAugmentedSchema({
  config: {
    auth: {
      hasRole: false,
      hasScope: false,
      isAuthenticated: true,
    },
    query: {
      exclude: ["User"],
    },
  },
  resolvers,
  typeDefs,
});

export { schema };
