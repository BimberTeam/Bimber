import { makeAugmentedSchema } from "./../../node_modules/neo4j-graphql-js";
import { neo4jgraphql } from "./../..//node_modules/neo4j-graphql-js";
import { GroupTypes } from "./group/types";
import { GroupMutations } from "./group/mutations";
import swipeToLike from "./group/resolvers/swipeToLike";
import swipeToDislike from "./group/resolvers/swipeToDislike";
import { GroupQueries } from "./group/queries";
import { AccountInputs } from "./user/inputs";
import { AccountTypes } from "./user/types";
import login from "./user/resolvers/login";
import { AccountMutations } from "./user/mutations";
import register from "./user/resolvers/register";
import updateAccount from "./user/resolvers/updateAccount"
import { AccountQueries } from "./user/queries";
import addFriendToGroup from "./group/mutations/addFriendToGroup";
import getAccountInfoFromContex from "./common/getAccountInfoFromContext";
import pendingMembersList from "./group/queries/pendingMembersList";
import { GroupInputs } from "./group/inputs";
import acceptGroupPendingUser from "./group/mutations/acceptPendingRequest";
import rejectGroupPendingUser from "./group/mutations/rejectPendingRequest";
import { UtilTypes } from "./common/types";
import groupInvitation from "./group/mutations/groupInvitation";
import createGroup from "./group/mutations/createGroup";

export const typeDefs = `
  ${AccountTypes}
  ${GroupTypes}

  ${UtilTypes}

  ${AccountInputs}

  type Query {
    ${AccountQueries}
    ${GroupQueries}
  }

  type Mutation {
    ${AccountMutations}
    ${GroupMutations}
  }

  ${AccountInputs}
  ${GroupInputs}
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
    deleteAccount(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    acceptGroupInvitation(object, params, ctx, resolveInfo) {
      return groupInvitation(object, params, ctx, resolveInfo);
    },
    rejectGroupInvitation(object, params, ctx, resolveInfo) {
      return groupInvitation(object, params, ctx, resolveInfo);
    },
    register,
    createGroup,
    swipeToLike,
    swipeToDislike,
    updateAccount,
    addFriendToGroup,
    acceptGroupPendingUser,
    rejectGroupPendingUser,
  },
  Query: {
    me(object, params, ctx, resolveInfo) {
      return getAccountInfoFromContex(object, params, ctx, resolveInfo);
    },
    accountExists(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
    user(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
    group(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
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
