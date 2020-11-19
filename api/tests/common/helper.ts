import { ME } from './../user/queries';
import { REGISTER, LOGIN, ADD_FRIEND, ACCEPT_FRIEND_REQUEST, DENY_FRIEND_REQUEST } from './../user/mutations';
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

export const createUserAndAddToFriend = async (mockUser, mockUserFriend, mutate, setOptions): Promise<{inviterId: string, friendId: string}> => {
    const inviterId: string = await registerUser(mutate, mockUser);
    const friendId: string = await registerUser(mutate, mockUserFriend);

    await login(mutate, mockUser, setOptions);

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

    return {inviterId, friendId};
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