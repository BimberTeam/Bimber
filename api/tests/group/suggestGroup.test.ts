import { Session } from 'neo4j-driver';
import { mockedUsers } from './../user/mock';
import { SUGGEST_GROUPS } from './queries';
import { registerUser, invalidTokenTest, login, setToken, sendGroupInvitationsMutation, updateLocation, acceptGroupInvitation, getMeGroupId, swipeToLike } from './../common/helper';
import { prepareDbForTests, clearDatabase } from './../../src/app';

export const suggestGroupTest = (query, mutate, setOptions, session: Session) => {
    describe('SuggestGroup query', () => {
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

        invalidTokenTest(SUGGEST_GROUPS, mutate, setOptions);

        test("should return groups in the proper order", async () => {
            const [me, userA, userB] = mockedUsers
            const meId: string = await registerUser(mutate, me);
            const userBId: string = await registerUser(mutate, userB);
            const {friendsId: [userAId], groupId} = await sendGroupInvitationsMutation(userBId, userB, [userA], mutate, query, setOptions);

            await acceptGroupInvitation(userA, groupId, mutate, setOptions);

            await updateLocation(me, {latitude: 0, longitude: 0}, mutate, setOptions);
            await updateLocation(userB, {latitude: 3, longitude: 3}, mutate, setOptions);
            await updateLocation(userA, {latitude: 5, longitude: 5}, mutate, setOptions);

            const userAGroupId: string = await getMeGroupId(userAId, session)
            const userBGroupId: string = await getMeGroupId(userBId, session)
            const meGroupId: string = await getMeGroupId(meId, session)

            await login(mutate, userA, setOptions);
            await swipeToLike(userA, meGroupId, mutate, setOptions);

            await login(mutate, me, setOptions);
            const suggestGroupInput = {
                variables :  {
                    limit: 2,
                    range: 1000000
                }
            }

            let suggestGroups;
            ({data: {suggestGroups}} = await mutate(SUGGEST_GROUPS, suggestGroupInput));

            expect(suggestGroups[0].id).toEqual(userAGroupId);
            expect(suggestGroups[0].averageLocation.latitude.toPrecision(2)).toEqual("5.0");
            expect(suggestGroups[0].averageLocation.longitude.toPrecision(2)).toEqual("5.0");
            expect(suggestGroups[0].averageAge.toPrecision(2)).toEqual("13");
            expect(suggestGroups[1].id).toEqual(userBGroupId);
            expect(suggestGroups[1].averageLocation.latitude.toPrecision(2)).toEqual("3.0");
            expect(suggestGroups[1].averageLocation.longitude.toPrecision(2)).toEqual("3.0");
            expect(suggestGroups[1].averageAge.toPrecision(2)).toEqual("15");

            await swipeToLike(me, userAGroupId, mutate, setOptions);
            ({data: {suggestGroups}} = await mutate(SUGGEST_GROUPS, suggestGroupInput));

            expect(suggestGroups[0].id).toEqual(userBGroupId);
            expect(suggestGroups[0].averageLocation.latitude.toPrecision(2)).toEqual("3.0");
            expect(suggestGroups[0].averageLocation.longitude.toPrecision(2)).toEqual("3.0");
            expect(suggestGroups[0].averageAge.toPrecision(2)).toEqual("15");
            expect(suggestGroups[1].id).toEqual(groupId);
            expect(suggestGroups[1].averageLocation.latitude.toPrecision(2)).toEqual("4.0");
            expect(suggestGroups[1].averageLocation.longitude.toPrecision(2)).toEqual("4.0");
            expect(suggestGroups[1].averageAge.toPrecision(2)).toEqual("14");
        });

    });
};