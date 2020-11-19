import { mockedUsers } from './mock';
import { REGISTER } from './mutations';
import { prepareDbForTests, clearDatabase } from './../../src/app';

export const registerTests = (query, mutate) => {
    describe('Register mutation', () => {

        const registerInput=  {
            variables: mockedUsers[0]
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

            expect(register.name).toEqual("kuba4");
            expect(register.email).toEqual("Jacek@111");
            expect(register.password).not.toEqual("lalala");
            expect(register.age).toEqual(10);
            expect(register.favoriteAlcoholName).toEqual("Harnas");
            expect(register.favoriteAlcoholType).toEqual("VODKA");
            expect(register.description).toEqual("test");
            expect(register.genderPreference).toEqual("MALE");
            expect(register.gender).toEqual("MALE");
            expect(register.alcoholPreference).toEqual("VODKA");
            expect(register.agePreferenceFrom).toEqual(3);
            expect(register.agePreferenceTo).toEqual(7);
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
