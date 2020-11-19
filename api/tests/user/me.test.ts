import { invalidTokenTest, registerUser, setToken, meQuery, login } from './../common/helper';
import { ME } from './queries';
import { mockUser } from './mock';
import { prepareDbForTests, clearDatabase } from './../../src/app';

export const meTests = (query, mutate, setOptions) => {
    describe("Me query", () => {

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
            await registerUser(mutate, mockUser);
        });

        invalidTokenTest(ME, query, setOptions);

        test("should succeed on valid token", async () => {
            await login(mutate, mockUser.email, mockUser.password, setOptions);
            const me = await meQuery(query);
            expect(me.name).toEqual("kuba4");
            expect(me.email).toEqual("Jacek@111");
            expect(me.password).not.toEqual("lalala");
            expect(me.age).toEqual(10);
            expect(me.favoriteAlcoholName).toEqual("Harnas");
            expect(me.favoriteAlcoholType).toEqual("VODKA");
            expect(me.description).toEqual("test");
            expect(me.genderPreference).toEqual("MALE");
            expect(me.gender).toEqual("MALE");
            expect(me.alcoholPreference).toEqual("VODKA");
            expect(me.agePreferenceFrom).toEqual(3);
            expect(me.agePreferenceTo).toEqual(7);
            expect(me.friends).toEqual([]);
        });
    });
};