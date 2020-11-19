import { REMOVE_FRIEND } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, createUserAndAddToFriend, deleteSingleQuote, meQuery } from './../common/helper';
import { mockedUsers } from './mock';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import { userNotFoundError, lackingFriendshipError } from './../../src/graphql/user/mutations/removeFriend';
import { friendDeletedSuccess } from './../../src/graphql/user/mutations';

export const removeFriendTest = (query, mutate, setOptions) => {
    describe('RemoveFriend mutation', () => {
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

        invalidTokenTest(REMOVE_FRIEND, mutate, setOptions);

        test('should validate that user exists', async () => {
            await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const removeFriendInput = {
                variables: {
                    input: {
                       id: "invalidFriendID"
                    }
                }
            };

            const {errors: [error]}  = await mutate(REMOVE_FRIEND, removeFriendInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(userNotFoundError);
            expect(code).toEqual('400');

        });

        test('should fail when friendship exists', async () => {
            const friendId: string = await registerUser(mutate, mockedUsers[1]);
            await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const removeFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            const {errors: [error]}  = await mutate(REMOVE_FRIEND, removeFriendInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(lackingFriendshipError);
            expect(code).toEqual('400');

        });

        test("should succeed on valid data", async () => {
            const {inviterId, friendId} = await createUserAndAddToFriend(mockedUsers[0], mockedUsers[1], mutate, setOptions);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            const removeFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            const {data: {removeFriend}}  = await mutate(REMOVE_FRIEND, removeFriendInput);

            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);
            const {friends: inviterFriends} = await meQuery(query);

            await login(mutate, mockedUsers[1].email, mockedUsers[1].password, setOptions);
            const {friends: meFriends} = await meQuery(query);

            expect(removeFriend.message).toEqual(deleteSingleQuote(friendDeletedSuccess));
            expect(removeFriend.status).toEqual('OK');
            expect(inviterFriends).toEqual([]);
            expect(meFriends).toEqual([]);
        });
    });


};