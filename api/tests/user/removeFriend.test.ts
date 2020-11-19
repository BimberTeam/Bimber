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
            const [me] = mockedUsers
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

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
            const [me, friend] = mockedUsers
            const friendId: string = await registerUser(mutate, friend);
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

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
            const [me, inviter] = mockedUsers
            const {inviterId, friendId} = await createUserAndAddToFriend(inviter, me, mutate, setOptions);
            await login(mutate, inviter, setOptions);

            const removeFriendInput = {
                variables: {
                    input: {
                       id: friendId
                    }
                }
            };

            const {data: {removeFriend}}  = await mutate(REMOVE_FRIEND, removeFriendInput);

            await login(mutate, inviter, setOptions);
            const {friends: inviterFriends} = await meQuery(query);

            await login(mutate, me, setOptions);
            const {friends: meFriends} = await meQuery(query);

            expect(removeFriend.message).toEqual(deleteSingleQuote(friendDeletedSuccess));
            expect(removeFriend.status).toEqual('OK');
            expect(inviterFriends).toEqual([]);
            expect(meFriends).toEqual([]);
        });
    });


};