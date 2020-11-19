import { ADD_FRIEND } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, createUserAndSendFriendRequest, deleteSingleQuote, meQuery } from './../common/helper';
import { mockedUsers } from './mock';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import {userNotFoundError, friendRequestExistsError, requestedFriendIsMeError} from './../../src/graphql/user/mutations/sendFriendRequest';
import {friendAddedSuccess, friendshipRequestSentSuccess} from './../../src/graphql/user/mutations';

export const addFriendTest = (query, mutate, setOptions) => {
    describe('AddFriend mutation', () => {
        beforeAll(async  () => {
            await prepareDbForTests();
        }, 20000);

        afterAll(async () => {
            await clearDatabase();
            await setToken('', setOptions);
        });

        beforeEach(async () => {
            await clearDatabase();
            await setToken('', setOptions);
        });

        invalidTokenTest(ADD_FRIEND, mutate, setOptions);

        test("should validate that friend exists", async () => {
            await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const addFriendInput = {
                variables: {
                    input: {
                       id: "invalidFriendID"
                    }
                }
            };

            const {errors: [error]} = await mutate(ADD_FRIEND, addFriendInput);
            const {code} = error.extensions

            expect(error.message).toEqual(userNotFoundError);
            expect(code).toEqual('400');
        });

        test("should succeed on valid data", async () => {
            await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const friendId: string = await registerUser(mutate, mockedUsers[1]);

            const addFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            const {data: {sendFriendRequest}} = await mutate(ADD_FRIEND, addFriendInput);
            expect(sendFriendRequest.message).toEqual(deleteSingleQuote(friendshipRequestSentSuccess));
            expect(sendFriendRequest.status).toEqual('OK');
        });

        test("should validate that user is already send friendRequest", async () => {
            await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const friendId: string = await createUserAndSendFriendRequest(mockedUsers[1], mutate);

            const addFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            const {errors: [error]} = await mutate(ADD_FRIEND, addFriendInput);
            const {code} = error.extensions

            expect(error.message).toEqual(friendRequestExistsError);
            expect(code).toEqual('400');
        });

        test("should succeed if user send friend request to friend, friend send friend request to user, and friendship will be create", async () => {
            const meId: string = await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const friendId: string = await createUserAndSendFriendRequest(mockedUsers[1], mutate);
            await login(mutate, mockedUsers[1].email, mockedUsers[1].password, setOptions);

            const addFriendInput = {
                variables: {
                    input: {
                       id: meId
                    }
                }
            };

            const {data: {sendFriendRequest}} = await mutate(ADD_FRIEND, addFriendInput);

            const {friends: [friend]} = await meQuery(query);

            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);
            const {friends: [meFriend]} = await meQuery(query);

            expect(sendFriendRequest.message).toEqual(deleteSingleQuote(friendAddedSuccess));
            expect(friend.id).toEqual(meId);
            expect(meFriend.id).toEqual(friendId);
        });

        test("should fail when user want send friend request to himself", async () => {
            const meId: string = await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const addFriendInput = {
                variables: {
                    input: {
                       id: meId
                    }
                }
            };

            const {errors: [error]} = await mutate(ADD_FRIEND, addFriendInput);
            const {code} = error.extensions

            expect(error.message).toEqual(requestedFriendIsMeError);
            expect(code).toEqual('400');
        });
    });
};