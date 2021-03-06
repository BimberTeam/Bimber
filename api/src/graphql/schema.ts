import { makeAugmentedSchema } from "./../../node_modules/neo4j-graphql-js";
import { neo4jgraphql } from "./../..//node_modules/neo4j-graphql-js";
import { GroupTypes } from "./group/types";
import { GroupMutations } from "./group/mutations";
import swipeToLike from "./group/resolvers/swipeToLike";
import swipeToDislike from "./group/resolvers/swipeToDislike";
import sendChatMessage from "./chat/resolvers/sendChatMessage";
import loadChatMessages from "./chat/resolvers/loadChatMessages";
import chatThumbnails from "./chat/resolvers/chatThumbnails";
import { GroupQueries } from "./group/queries";
import { AccountInputs } from "./user/inputs";
import { AccountTypes } from "./user/types";
import login from "./user/resolvers/login";
import { AccountMutations } from "./user/mutations";
import register from "./user/resolvers/register";
import updateAccount from "./user/mutations/updateAccount"
import { AccountQueries } from "./user/queries";
import addFriendToGroup from "./group/mutations/addFriendToGroup";
import getAccountInfoFromContex from "./common/getAccountInfoFromContext";
import groupCandidates from "./group/queries/groupCandidates";
import { GroupInputs } from "./group/inputs";
import acceptGroupPendingUser from "./group/mutations/acceptPendingRequest";
import rejectGroupPendingUser from "./group/mutations/rejectPendingRequest";
import { UtilTypes } from "./common/types";
import groupInvitation from "./group/mutations/groupInvitation";
import createGroup from "./group/mutations/createGroup";
import { DateScalar } from "./scalars";
import { ChatQueries } from "./chat/queries";
import { ChatMutations } from "./chat/mutations";
import { ChatSubscriptions } from "./chat/subscriptions";
import { pubsub } from "./pubsub";
import { ensureAuthorized } from "./common/helper";
import { ChatTypes } from "./chat/types";
import { ChatInputs } from "./chat/inputs";
import listFriendsWithoutGroupMembership from "./group/queries/listFriendsWithoutGroupMembership";
import updateLocation from "./user/mutations/updateLocation";
import groupMembersWithoutFriendship from "./group/queries/groupMembersWithoutFriendship";
import groupCandidatesResult from "./group/queries/groupCandidatesResult";
import sendFriendRequest from "./user/mutations/sendFriendRequest";
import friendRequest from "./user/common/friendRequest";
import removeFriend from "./user/mutations/removeFriend";
import suggestGroups from "./group/queries/suggestGroups";
import groupTTL from "./group/queries/groupTTL";

export const typeDefs = `
  scalar BimberDate

  ${AccountTypes}
  ${GroupTypes}
  ${UtilTypes}
  ${AccountInputs}
  ${ChatTypes}

  type Query {
    ${AccountQueries}
    ${ChatQueries}
    ${GroupQueries}
  }

  type Mutation {
    ${AccountMutations}
    ${ChatMutations}
    ${GroupMutations}
  }

  type Subscription {
    ${ChatSubscriptions}
  }

  ${AccountInputs}
  ${GroupInputs}
  ${ChatInputs}
`;

const resolvers = {
  BimberDate: DateScalar,
  Mutation: {
    login,
    acceptFriendRequest(object, params, ctx, resolveInfo) {
      return friendRequest(object, params, ctx, resolveInfo);
    },
    denyFriendRequest(object, params, ctx, resolveInfo) {
      return friendRequest(object, params, ctx, resolveInfo);
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
    sendFriendRequest,
    removeFriend,
    register,
    createGroup,
    swipeToLike,
    swipeToDislike,
    updateAccount,
    addFriendToGroup,
    acceptGroupPendingUser,
    rejectGroupPendingUser,
    sendChatMessage,
    updateLocation
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
    groupCandidates,
    loadChatMessages,
    chatThumbnails,
    listFriendsWithoutGroupMembership,
    groupMembersWithoutFriendship,
    groupCandidatesResult,
    suggestGroups,
    groupTTL
  },
  Subscription: {
    newChatMessage: {
      subscribe: async (object, params, ctx) => {
        await ensureAuthorized(ctx);
        return pubsub.asyncIterator(`newChatMessage:${params.input.groupId}`);
      }
    }

  }
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
    subscription: false
  },
  resolvers,
  typeDefs,
});

export { schema };
