import { mockedUsers } from './mock';
import { UPDATE_LOCATION } from './mutations';
import { invalidTokenTest, setToken, registerUser, login, deleteSingleQuote, meQuery } from './../common/helper';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import { updatedLocationSuccess } from './../../src/graphql/user/mutations';

export const updateLocationTest = (query, mutate, setOptions) => {
    describe('UpdateLocation mutation', () => {
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

        invalidTokenTest(UPDATE_LOCATION, mutate, setOptions);

        test("should succeed on valid data", async () => {
            const [me] = mockedUsers;
            await registerUser(mutate, me);
            await login(mutate, me, setOptions);

            const updateLocationInput = {
                variables: {
                    latitude: 3.2,
                    longitude: 3.3
                }
            };

            const {data: {updateLocation}} = await mutate(UPDATE_LOCATION, updateLocationInput);
            const {latestLocation} = await meQuery(query);

            expect(updateLocation.message).toEqual(deleteSingleQuote(updatedLocationSuccess));
            expect(updateLocation.status).toEqual('OK');
            expect(latestLocation.latitude.toPrecision(2)).toEqual("3.2");
            expect(latestLocation.longitude.toPrecision(2)).toEqual("3.3");
        });
    });
};