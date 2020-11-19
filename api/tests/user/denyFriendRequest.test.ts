import { ACCEPT_FRIEND_REQUEST, DENY_FRIEND_REQUEST } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, createUserAndSendFriendRequest, deleteSingleQuote, meQuery, replyToFriendRequestMutation } from './../common/helper';
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

        test("should validate that inviter exists", async () => {
            await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);
            await createUserAndSendFriendRequest(mockedUsers[1], mutate);

            await login(mutate, mockedUsers[1].email, mockedUsers[1].password, setOptions);
            const {errors: [error]} = await replyToFriendRequestMutation(mutate, "invalidID", DENY_FRIEND_REQUEST);
            const {code} = error.extensions

            expect(error.message).toEqual(userNotFoundError);
            expect(code).toEqual('400');
        });

        test("should validate that invitation exists", async () => {
            const inviterId: string = await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);

            await registerUser(mutate, mockedUsers[1]);
            await login(mutate, mockedUsers[1].email, mockedUsers[1].password, setOptions);
            const {errors: [error]}  = await replyToFriendRequestMutation(mutate, inviterId, DENY_FRIEND_REQUEST);
            const {code} = error.extensions

            expect(error.message).toEqual(lackingFriendRequestError);
            expect(code).toEqual('400');
        });

        test("should succeed on valid data", async () => {
            const inviterId: string = await registerUser(mutate, mockedUsers[0]);
            await login(mutate, mockedUsers[0].email, mockedUsers[0].password, setOptions);
            await createUserAndSendFriendRequest(mockedUsers[1], mutate);

            await login(mutate, mockedUsers[1].email, mockedUsers[1].password, setOptions);
            const {data: {denyFriendRequest}}  = await replyToFriendRequestMutation(mutate, inviterId, DENY_FRIEND_REQUEST);

            expect(denyFriendRequest.message).toEqual(deleteSingleQuote(friendshipRequestDeniedSuccess));
            expect(denyFriendRequest.status).toEqual('OK');
        });
    });
};