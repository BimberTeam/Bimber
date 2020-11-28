import { Session } from 'neo4j-driver';
import { executeQuery } from './../../src/graphql/common/helper';
import { CREATE_GROUP, ACCEPT_GROUP_INVITATION, SWIPE_TO_DISLIKE, SWIPE_TO_LIKE } from './../group/mutations';
import { ME } from './../user/queries';
import { REGISTER, LOGIN, ADD_FRIEND, ACCEPT_FRIEND_REQUEST, DENY_FRIEND_REQUEST, UPDATE_LOCATION } from './../user/mutations';
import { mockedUsers } from './../user/mock';
import { HttpQueryError } from "apollo-server-core";
import { DocumentNode } from 'graphql';

/*
    Testing for an exepction beacuse context creation for ApolloServer request throws one
*/

export const invalidTokenTest = (request, serverClient, setOptions): void => {
    test("should fail on invalid token", async () => {
        await setToken('invalidToken', setOptions);
        await expect(serverClient(request)).rejects.toThrow(HttpQueryError);
    });
};

export const registerUser = async(mutate, registerInput): Promise<string> => {
    const {data: {register}}  = await mutate(REGISTER, {
        variables: registerInput
    });
    return register.id;
};

export const login = async(mutate, user, setOptions): Promise<string> => {
    const loginInput = {
        variables: {
            email: user.email,
            password: user.password
        }
    };

    const {data: {login}}  = await mutate(LOGIN, loginInput);
    await setOptions({
        request: {
            headers: {
                Authorization: login.token,
            }
        },
    });
    return login.token;
};

export const setToken = async (token: string, setOptions): Promise<void> => {
    await setOptions({
        request: {
            headers: {
                Authorization: token,
            }
        },
    });
};

export const createUserAndAddToFriend = async (inviterId:string, inviter, mockUserFriend, mutate, setOptions): Promise<string> => {
    const friendId: string = await registerUser(mutate, mockUserFriend);

    await login(mutate, inviter, setOptions);

    let addFriendInput = {
        variables: {
            input: {
                id: friendId
            }
        }
    };

    await mutate(ADD_FRIEND, addFriendInput);

    await login(mutate, mockUserFriend, setOptions);

    addFriendInput = {
        variables: {
            input: {
                id: inviterId
            }
        }
    };
    await mutate(ADD_FRIEND, addFriendInput);

    return friendId;
};

export const meQuery = async (query): Promise<any> => {
    const {data: {me}} = await query(ME);
    return me;
};

export const deleteSingleQuote = (text: string) => {
    return text.substring(1, text.length-1);
};

export const replyToFriendRequestMutation = async (mutate, inviterId: string, mutation: DocumentNode) => {
    const acceptFriendRequestInput = {
        variables: {
            input: {
                id: inviterId
            }
        }
    };

    return await mutate(mutation, acceptFriendRequestInput);
};

export const sendGroupInvitationsMutation = async (meId, me, groupMembers: any[], mutate, query, setOptions): Promise<{friendsId: string[], groupId:string}> => {
    await login(mutate, me, setOptions);

    let friendsId: string[] = [];

    for(const member of groupMembers) {
        friendsId.push(await createUserAndAddToFriend(meId, me, member, mutate, setOptions));
    }

    await login(mutate, me, setOptions);
    const createGroupInput = {
        variables: {
            usersId: friendsId
        }
    }

    await mutate(CREATE_GROUP, createGroupInput);
    const {groups: meGroups} = await meQuery(query);

    return {
        friendsId: friendsId,
        groupId: meGroups[0].id
    };
};

export const acceptGroupInvitation = async (me, groupId, mutate, setOptions): Promise<void> =>  {
    await login(mutate, me, setOptions);

    const acceptGroupInvitationInput = {
        variables: {
            input: {
                groupId
            }
        }
    }

    await mutate(ACCEPT_GROUP_INVITATION, acceptGroupInvitationInput);
};

export const updateLocation = async (me, location: {longitude: number, latitude: number}, mutate, setOptions): Promise<void> => {
    await login(mutate, me, setOptions);

    const updateLocationInput = {
        variables: {
            latitude: location.latitude,
            longitude: location.longitude
        }
    };

    await mutate(UPDATE_LOCATION, updateLocationInput);
};

export const getMeGroupId = async (meId: string, session: Session): Promise<string> => {
    const query = `
        MATCH (me:Account{id: "${meId}"})-[:OWNER]-(group:Group)
        RETURN group.id as result
    `;

    return await executeQuery<string>(session, query);
}

export const swipeToLike = async (me, groupId: string, mutate, setOptions): Promise<void> => {
    await login(mutate, me, setOptions);

    const swipeToLikeInput = {
        variables: {
            groupId: groupId
        }
    }

    await mutate(SWIPE_TO_LIKE, swipeToLikeInput);
};