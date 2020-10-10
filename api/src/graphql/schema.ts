import { makeAugmentedSchema } from "neo4j-graphql-js";
import { neo4jgraphql } from "neo4j-graphql-js";
import { Group } from "./group/model";
import { GroupMutations } from "./group/mutations/mutations";
import swipe from "./group/mutations/swipe";
import { GroupQueries } from "./group/queries/queries";
import { AccountInputs } from "./user/inputs";
import { Account } from "./user/model";
import login from "./user/mutations/login";
import { AccountMutations } from "./user/mutations/mutations";
import register from "./user/mutations/register";
import updateAccount from "./user/mutations/updateAccount"
import { AccountQueries } from "./user/queries";
import getAccountInfoFromContex from "./utils/getAccountInfoFromContext";
import pendingMembersList from "./group/queries/pendingMembersList";

export const typeDefs = `
  ${Account}
  ${Group}

  type Query {
    ${AccountQueries}
    ${GroupQueries}
  }

  type Mutation {
    ${AccountMutations}
    ${GroupMutations}
  }

  ${AccountInputs}
`;

const resolvers = {
  Mutation: {
    login,
    me(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
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
    pendingMembersList,
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
