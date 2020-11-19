import { mockedUsers } from './mock';
import { REGISTER } from './mutations';
import { prepareDbForTests, clearDatabase } from './../../src/app';

export const registerTests = (query, mutate) => {
    describe('Register mutation', () => {

        const [me] = mockedUsers;
        const registerInput=  {
            variables: me
        };

        beforeAll(async  () => {
            await prepareDbForTests();
        }, 20000);

        afterAll(async () => {
            await clearDatabase();
        });

        beforeEach(async () => {
            await clearDatabase();
        });

        test('should not allow for duplicated emails', async () => {
            await mutate(REGISTER, registerInput);
            const {errors: [error]} = await mutate(REGISTER, registerInput);
            const {code} = error.extensions

            expect(error.message).toEqual("\'Podany email jest zajęty!\'");
            expect(code).toEqual('200');
        });

        test('should succeed on valid input data', async () => {
            const {data: {register}} = await mutate(REGISTER, registerInput);

            expect(register.name).toEqual(me.name);
            expect(register.email).toEqual(me.email);
            expect(register.password).not.toEqual(me.password);
            expect(register.age).toEqual(me.age);
            expect(register.favoriteAlcoholName).toEqual(me.favoriteAlcoholName);
            expect(register.favoriteAlcoholType).toEqual(me.favoriteAlcoholType);
            expect(register.description).toEqual(me.description);
            expect(register.genderPreference).toEqual(me.genderPreference);
            expect(register.gender).toEqual(me.gender);
            expect(register.alcoholPreference).toEqual(me.alcoholPreference);
            expect(register.agePreferenceFrom).toEqual(me.agePreferenceFrom);
            expect(register.agePreferenceTo).toEqual(me.agePreferenceTo);
        });

        test('should succeed with null gender preference', async () => {
            const genderPreferenceNullInput =   {
                variables: {
                    name: "kuba4",
                    email: "Jacek@111",
                    password: "lalala",
                    age: 10,
                    favoriteAlcoholName: "Harnas",
                    favoriteAlcoholType: "VODKA",
                    description: "test",
                    genderPreference: null,
                    gender: "MALE",
                    alcoholPreference: "VODKA",
                    agePreferenceFrom: 3,
                    agePreferenceTo: 7,
                }
            };

            const {data: {register}} = await mutate(REGISTER, genderPreferenceNullInput);

            expect(register.genderPreference).toBeNull();
        });
    })
};
