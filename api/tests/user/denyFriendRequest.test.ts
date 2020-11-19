import { ACCEPT_FRIEND_REQUEST, DENY_FRIEND_REQUEST, ADD_FRIEND } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, deleteSingleQuote, replyToFriendRequestMutation, meQuery } from './../common/helper';
import { mockedUsers } from './mock';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import {userNotFoundError, lackingFriendRequestError} from './../../src/graphql/user/common/friendRequest';
import {friendshipRequestDeniedSuccess} from './../../src/graphql/user/mutations';

export const denyFriendRequestTest = (query, mutate, setOptions) => {
    describe('DenyFriendRequest mutation', () => {
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

        invalidTokenTest(ACCEPT_FRIEND_REQUEST, mutate, setOptions);

        test("should validate that the inviter exists", async () => {
            const [me, inviter] = mockedUsers;
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            const {errors: [error]} = await replyToFriendRequestMutation(mutate, "invalidID", DENY_FRIEND_REQUEST);
            const {code} = error.extensions

            expect(error.message).toEqual(userNotFoundError);
            expect(code).toEqual('400');
        });

        test("should validate that an invitation exists", async () => {
            const [me, inviter] = mockedUsers;
            const inviterId: string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            await registerUser(mutate, inviter);
            await login(mutate, inviter, setOptions);
            const {errors: [error]}  = await replyToFriendRequestMutation(mutate, inviterId, DENY_FRIEND_REQUEST);
            const {code} = error.extensions

            expect(error.message).toEqual(lackingFriendRequestError);
            expect(code).toEqual('400');
        });

        test("should succeed on valid data", async () => {
            const [me, inviter] = mockedUsers;
            const inviterId: string = await registerUser(mutate, inviter);
            const meId: string = await registerUser(mutate, me);

            await login(mutate, inviter, setOptions);

            const addFriendInput = {
                variables: {
                    input: {
                        id: meId
                    }
                }
            };

            await mutate(ADD_FRIEND, addFriendInput);

            await login(mutate, me, setOptions);
            const {data: {denyFriendRequest}}  = await replyToFriendRequestMutation(mutate, inviterId, DENY_FRIEND_REQUEST);
            const {friends: meFriends} = await meQuery(query);

            await login(mutate, inviter, setOptions);
            const {friends: inviterFriends} = await meQuery(query);

            expect(denyFriendRequest.message).toEqual(deleteSingleQuote(friendshipRequestDeniedSuccess));
            expect(denyFriendRequest.status).toEqual('OK');
            expect(inviterFriends).toEqual([]);
            expect(meFriends).toEqual([]);
        });
    });
};