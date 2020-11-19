import { ACCEPT_FRIEND_REQUEST } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, createUserAndSendFriendRequest, deleteSingleQuote, meQuery, replyToFriendRequestMutation } from './../common/helper';
import { mockUser, mockFriendUser } from './mock';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import {userNotFoundError, lackingFriendRequestError} from './../../src/graphql/user/common/friendRequest';
import {friendAddedSuccess} from './../../src/graphql/user/mutations';

export const acceptFriendRequestTest = (query, mutate, setOptions) => {
    describe('AcceptFriendRequest mutation', () => {
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
            await registerUser(mutate, mockUser);
            await login(mutate, mockUser.email, mockUser.password, setOptions);
            await createUserAndSendFriendRequest(mockFriendUser, mutate);

            await login(mutate, mockFriendUser.email, mockFriendUser.password, setOptions);
            const {errors: [error]} = await replyToFriendRequestMutation(mutate, "invalidID", ACCEPT_FRIEND_REQUEST);
            const {code} = error.extensions

            expect(error.message).toEqual(userNotFoundError);
            expect(code).toEqual('400');
        });

        test("should validate that invitation exists", async () => {
            const inviterId: string = await registerUser(mutate, mockUser);
            await login(mutate, mockUser.email, mockUser.password, setOptions);

            await registerUser(mutate, mockFriendUser);
            await login(mutate, mockFriendUser.email, mockFriendUser.password, setOptions);
            const {errors: [error]}  = await replyToFriendRequestMutation(mutate, inviterId, ACCEPT_FRIEND_REQUEST);
            const {code} = error.extensions

            expect(error.message).toEqual(lackingFriendRequestError);
            expect(code).toEqual('400');
        });

        test("should succeed on valid data", async () => {
            const inviterId: string = await registerUser(mutate, mockUser);
            await login(mutate, mockUser.email, mockUser.password, setOptions);
            const meId:string = await createUserAndSendFriendRequest(mockFriendUser, mutate);

            await login(mutate, mockFriendUser.email, mockFriendUser.password, setOptions);
            const {data: {acceptFriendRequest}}  = await replyToFriendRequestMutation(mutate, inviterId, ACCEPT_FRIEND_REQUEST);
            const {friends: [friend]} = await meQuery(query);

            await login(mutate, mockUser.email, mockUser.password, setOptions);
            const {friends: [meFriend]} = await meQuery(query);

            expect(acceptFriendRequest.message).toEqual(deleteSingleQuote(friendAddedSuccess));
            expect(acceptFriendRequest.status).toEqual('OK');
            expect(friend.id).toEqual(inviterId);
            expect(meFriend.id).toEqual(meId);
        });
    });
};