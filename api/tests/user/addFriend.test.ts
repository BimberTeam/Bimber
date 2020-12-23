import { ADD_FRIEND } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, deleteSingleQuote, meQuery } from './../common/helper';
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
            const [me] = mockedUsers;
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

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
            const [me, friend] = mockedUsers;
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            const friendId: string = await registerUser(mutate, friend);

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

        test("should fail when trying to send same friend request again", async () => {
            const [me, friend] = mockedUsers;
            await registerUser(mutate, me);
            const friendId:string = await registerUser(mutate, friend);
            await login(mutate, me, setOptions);

            const addFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            await mutate(ADD_FRIEND, addFriendInput);
            const {errors: [error]} = await mutate(ADD_FRIEND, addFriendInput);
            const {code} = error.extensions

            expect(error.message).toEqual(friendRequestExistsError);
            expect(code).toEqual('400');
        });

        test("should create friendship if two people send each other friend requests", async () => {
            const [me, friendUser] = mockedUsers;
            const meId: string = await registerUser(mutate, me);
            const friendId: string = await registerUser(mutate, friendUser);

            await login(mutate, me, setOptions);

            let addFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            await mutate(ADD_FRIEND, addFriendInput);

            await login(mutate, friendUser, setOptions);

            addFriendInput = {
                variables: {
                    input: {
                       id: meId
                    }
                }
            };

            const {data: {sendFriendRequest}} = await mutate(ADD_FRIEND, addFriendInput);

            const {friends: [friend]} = await meQuery(query);

            await login(mutate, me, setOptions);
            const {friends: [meFriend]} = await meQuery(query);

            expect(sendFriendRequest.message).toEqual(deleteSingleQuote(friendAddedSuccess));
            expect(friend.id).toEqual(meId);
            expect(meFriend.id).toEqual(friendId);
        });

        test("should fail when user sends himself friend request", async () => {
            const [me] = mockedUsers;
            const meId: string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);

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