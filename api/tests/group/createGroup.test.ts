import { mockedUsers } from './../user/mock';
import { CREATE_GROUP } from './mutations';
import { invalidTokenTest, setToken, registerUser, login, createUserAndAddToFriend, deleteSingleQuote, meQuery } from './../common/helper';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import {userNotFoundError, lackingFriendshipError} from '../../src/graphql/group/mutations/createGroup';
import {groupCreatedSuccess} from '../../src/graphql/group/mutations';

export const createGroupTest = (query, mutate, setOptions) => {
    describe('CreateGroup mutation', () => {
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

        invalidTokenTest(CREATE_GROUP, mutate, setOptions);

        test("should fail when one of invited users doesn't exists", async () => {
            const [me, friend] = mockedUsers;

            await registerUser(mutate, me);
            const friendId: string = await registerUser(mutate, friend);

            await login(mutate, me, setOptions);

            const createGroupInput = {
                variables: {
                    usersId: ["InvalidID", friendId]
                }
            };

            const {errors: [error]}  = await mutate(CREATE_GROUP, createGroupInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(userNotFoundError);
            expect(code).toEqual('400');
        });

        test("should validate that all invited users are your friends", async () => {
            const [me, friend, user] = mockedUsers;

            const meId: string = await registerUser(mutate, me);
            const friendId: string = await createUserAndAddToFriend(meId, me, friend, mutate, setOptions)
            const userId: string = await registerUser(mutate, user);

            await login(mutate, me, setOptions);

            const createGroupInput = {
                variables: {
                    usersId: [friendId, userId]
                }
            };

            const {errors: [error]}  = await mutate(CREATE_GROUP, createGroupInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(lackingFriendshipError);
            expect(code).toEqual('400');
        });

        test("should succeed on valid data", async () => {
            const [me, friendA, friendB] = mockedUsers;

            const meId: string = await registerUser(mutate, me);
            const friendAId: string = await createUserAndAddToFriend(meId, me, friendA, mutate, setOptions);
            const friendBId: string = await createUserAndAddToFriend(meId, me, friendB, mutate, setOptions);

            await login(mutate, me, setOptions);

            const createGroupInput = {
                variables: {
                    usersId: [friendAId, friendBId]
                }
            }

            const {data: {createGroup}}  = await mutate(CREATE_GROUP, createGroupInput);

            await login(mutate, me, setOptions);
            const {groups: meGroups} = await meQuery(query);

            await login(mutate, friendA, setOptions);
            const {groupInvitations: friendAGroupInvitations} = await meQuery(query);

            await login(mutate, friendB, setOptions);
            const {groupInvitations: friendBGroupInvitations} = await meQuery(query);

            expect(createGroup.message).toEqual(deleteSingleQuote(groupCreatedSuccess));
            expect(createGroup.status).toEqual('OK');
            expect(meGroups).toEqual(friendAGroupInvitations);
            expect(meGroups).toEqual(friendBGroupInvitations);
        });

    });
};