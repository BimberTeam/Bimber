import { makeAugmentedSchema } from "./../../node_modules/neo4j-graphql-js";
import { neo4jgraphql } from "./../..//node_modules/neo4j-graphql-js";
import { GroupTypes } from "./group/types";
import { GroupMutations } from "./group/mutations";
import swipe from "./group/resolvers/swipe";
import { GroupQueries } from "./group/queries";
import { AccountInputs } from "./user/inputs";
import { AccountTypes } from "./user/types";
import login from "./user/resolvers/login";
import { AccountMutations } from "./user/mutations";
import register from "./user/resolvers/register";
import updateAccount from "./user/resolvers/updateAccount"
import { AccountQueries } from "./user/queries";
import getAccountInfoFromContex from "./common/getAccountInfoFromContext";
import pendingMembersList from "./group/queries/pendingMembersList";
import { GroupInputs } from "./group/inputs";
import acceptPendingRequest from "./group/mutations/acceptPendingRequest";
import rejectPendingRequest from "./group/mutations/rejectPendingRequest";
import { UtilTypes } from "./common/types";
import { UtilInputs } from "./common/inputs";

export const typeDefs = `
  ${AccountTypes}
  ${GroupTypes}

  ${UtilTypes}

  ${AccountInputs}
  ${UtilInputs}

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
    register,
    swipe,
    updateAccount,
    acceptPendingRequest,
    rejectPendingRequest,
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
