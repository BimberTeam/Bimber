import { mockedUsers } from './../user/mock';
import { SWIPE_TO_LIKE } from './mutations';
import { registerUser, invalidTokenTest, login, setToken, sendGroupInvitationsMutation, acceptGroupInvitation, deleteSingleQuote } from './../common/helper';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import { groupNotFoundError, alreadyPendingError, alreadyBelongsError} from './../../src/graphql/group/common/validateSwipe';
import { requestedGroupJoinSuccess } from './../../src/graphql/group/mutations';

export const swipeToLikeTest = (query, mutate, setOptions) => {
    describe('SwipeToLike mutation', () => {
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

        invalidTokenTest(SWIPE_TO_LIKE, mutate, setOptions);

        test("should validate that group exists", async () => {
            const [me] = mockedUsers
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            const swipeToLikeInput = {
                variables: {
                    groupId: "InvalidGroupId"
                }
            }

            const {errors: [error]}  = await mutate(SWIPE_TO_LIKE, swipeToLikeInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(groupNotFoundError);
            expect(code).toEqual('400');
        });

        test("should validate that user already pending to the group", async () => {
            const [me, friend, user] = mockedUsers
            const meId: string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);
            const {friendsId, groupId} = await sendGroupInvitationsMutation(meId, me, [friend], mutate, query, setOptions);

            await registerUser(mutate, user);
            await login(mutate, user, setOptions);

            const swipeToLikeInput = {
                variables: {
                    groupId: groupId
                }
            }

            await mutate(SWIPE_TO_LIKE, swipeToLikeInput);
            const {errors: [error]}  = await mutate(SWIPE_TO_LIKE, swipeToLikeInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(alreadyPendingError);
            expect(code).toEqual('400');
        });

        test("should validate that user already belongs to the group", async () => {
            const [me, friend] = mockedUsers
            const meId: string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);
            const {friendsId, groupId} = await sendGroupInvitationsMutation(meId, me, [friend], mutate, query, setOptions);

            await acceptGroupInvitation(me, groupId, mutate, setOptions);

            const swipeToLikeInput = {
                variables: {
                    groupId: groupId
                }
            }

            const {errors: [error]}  = await mutate(SWIPE_TO_LIKE, swipeToLikeInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(alreadyBelongsError);
            expect(code).toEqual('400');
        });

        test("should succeed on valid data", async () => {
            const [me, friend, user] = mockedUsers
            const meId: string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);
            const {friendsId, groupId} = await sendGroupInvitationsMutation(meId, me, [friend], mutate, query, setOptions);

            await registerUser(mutate, user);
            await login(mutate, user, setOptions);

            const swipeToLikeInput = {
                variables: {
                    groupId: groupId
                }
            }

            const {data: {swipeToLike}}  = await mutate(SWIPE_TO_LIKE, swipeToLikeInput);

            expect(swipeToLike.message).toEqual(deleteSingleQuote(requestedGroupJoinSuccess));
            expect(swipeToLike.status).toEqual('OK');
        });
    });

};