import { makeAugmentedSchema } from "neo4j-graphql-js";
import { neo4jgraphql } from "neo4j-graphql-js";
import { Group } from "./group/model";
import { GroupMutations } from "./group/mutations";
import swipe from "./group/resolvers/swipe";
import { GroupQueries } from "./group/queries";
import { AccountInputs } from "./user/inputs";
import { Account } from "./user/model";
import login from "./user/resovlers/login";
import { AccountMutations } from "./user/mutations";
import register from "./user/resovlers/register";
import updateAccount from "./user/resovlers/updateAccount"
import { AccountQueries } from "./user/queries";
import getAccountInfoFromContex from "./utils/getAccountInfoFromContext";

export const typeDefs = `
  ${Account}
  ${Group}

  ${AccountInputs}

  type Query {
    ${AccountQueries}
    ${GroupQueries}
  }

  type Mutation {
    ${AccountMutations}
    ${GroupMutations}
  }
`;

const resolvers = {
  Mutation: {
    login,
    acceptFriendRequest(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    removeFriend(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    sendFriendRequest(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    denyFriendRequest(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    register,
    swipe,
    updateAccount,
  },
  Query: {
    me(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    user(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
    group(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
    friendsList(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    requestedFriendsList(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    requestedGroupList(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    groupList(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
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
    mutation: false,
    query: false,
  },
  resolvers,
  typeDefs,
});

export { schema };
