import { invalidTokenTest, registerUser, setToken, meQuery, login } from './../common/helper';
import { ME } from './queries';
import { mockedUsers } from './mock';
import { prepareDbForTests, clearDatabase } from './../../src/app';

export const meTests = (query, mutate, setOptions) => {
    describe("Me query", () => {
        const [me] = mockedUsers;

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
            await registerUser(mutate, me);
        });

        invalidTokenTest(ME, query, setOptions);

        test("should succeed on valid token", async () => {
            const [me] = mockedUsers;
            await login(mutate, me, setOptions);
            const meResponse = await meQuery(query);
            expect(meResponse.name).toEqual("kuba4");
            expect(meResponse.email).toEqual("Jacek@111");
            expect(meResponse.password).not.toEqual("lalala");
            expect(meResponse.age).toEqual(10);
            expect(meResponse.favoriteAlcoholName).toEqual("Harnas");
            expect(meResponse.favoriteAlcoholType).toEqual("VODKA");
            expect(meResponse.description).toEqual("test");
            expect(meResponse.genderPreference).toEqual("MALE");
            expect(meResponse.gender).toEqual("MALE");
            expect(meResponse.alcoholPreference).toEqual("VODKA");
            expect(meResponse.agePreferenceFrom).toEqual(3);
            expect(meResponse.agePreferenceTo).toEqual(7);
            expect(meResponse.friends).toEqual([]);
        });
    });
};