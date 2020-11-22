import { ACCEPT_GROUP_INVITATION } from './mutations';
import { mockedUsers } from './../user/mock';
import { setToken, invalidTokenTest, login, registerUser, createGroupMutation, meQuery, deleteSingleQuote } from './../common/helper';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import { groupNotFoundError, lackingInvitationError } from './../../src/graphql/group/mutations/groupInvitation';
import {acceptGroupInvitationSuccess} from './../../src/graphql/group/mutations';

export const acceptGroupInvitationTest = (query, mutate, setOptions) => {
    describe('AcceptGroupInvitation mutation', () => {
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

        invalidTokenTest(ACCEPT_GROUP_INVITATION, mutate, setOptions);

        test("should validate that group exists", async () => {
            const [me] = mockedUsers
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            const acceptGroupInvitationInput = {
                variables: {
                    input: {
                        groupId: "InvalidGroupId"
                    }
                }
            }

            const {errors: [error]}  = await mutate(ACCEPT_GROUP_INVITATION, acceptGroupInvitationInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(groupNotFoundError);
            expect(code).toEqual('400');
        });


        test("should validate that group invitation exists", async () => {
            const [me, userA, userB] = mockedUsers
            const meId: string = await registerUser(mutate, me);
            await registerUser(mutate, userB);
            await login(mutate, me, setOptions);

            const {friendsId, groupId} = await createGroupMutation(meId, me, [userA], mutate, query, setOptions);

            const acceptGroupInvitationInput = {
                variables: {
                    input: {
                        groupId
                    }
                }
            }

            await login(mutate, userB, setOptions);
            const {groupInvitations: userBGroupInvitations} = await meQuery(query);

            const {errors: [error]}  = await mutate(ACCEPT_GROUP_INVITATION, acceptGroupInvitationInput);
            const {code} = error.extensions;

            expect(error.message).toEqual(lackingInvitationError);
            expect(code).toEqual('400');
            expect(userBGroupInvitations).toEqual([]);
        });

        test("should succeed on valid data", async () => {
            const [me, userA] = mockedUsers
            const meId: string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            const {friendsId, groupId} = await createGroupMutation(meId, me, [userA], mutate, query, setOptions);

            const acceptGroupInvitationInput = {
                variables: {
                    input: {
                        groupId
                    }
                }
            }

            await login(mutate, userA, setOptions);
            const {data: {acceptGroupInvitation}}  = await mutate(ACCEPT_GROUP_INVITATION, acceptGroupInvitationInput);
            const {groupInvitations, groups} = await meQuery(query);

            expect(acceptGroupInvitation.message).toEqual(deleteSingleQuote(acceptGroupInvitationSuccess));
            expect(acceptGroupInvitation.status).toEqual('OK');
            expect(groupInvitations).toEqual([]);
            expect(groups).toEqual([{id: groupId}]);
        });
    });

};