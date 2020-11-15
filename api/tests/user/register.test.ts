import { REGISTER } from './mutations';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import { createTestClient } from "apollo-server-testing";
import { server } from "../../src/app";

const {query, mutate} = createTestClient(server);

describe('Register tests', () => {

    beforeAll(async  () => {
        await prepareDbForTests();
    }, 10000);

    afterAll(async () => {
        await clearDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    test('Email is already taken test', async () => {
        const mutation =  {
            mutation: REGISTER,
            variables: {
                name: "kuba4",
                email: "Jacek@111",
                password: "lalala",
                age: 10,
                favoriteAlcoholName: "Harnas",
                favoriteAlcoholType: "VODKA",
                description: "asdasd",
                genderPreference: "MALE",
                gender: "MALE",
                alcoholPreference: "VODKA",
                agePreferenceFrom: 3,
                agePreferenceTo: 7,
            }
        };

        await mutate(mutation);
        const {errors: [error]} = await mutate(mutation);
        const {code} = error.extensions

        expect(error.message).toEqual("\'Podany email jest zajęty!\'");
        expect(code).toEqual('200');
    });

    test('Register success test', async () => {
        const mutation =  {
            mutation: REGISTER,
            variables: {
                name: "kuba4",
                email: "Jacek@1112",
                password: "lalala",
                age: 10,
                favoriteAlcoholName: "Harnas",
                favoriteAlcoholType: "VODKA",
                description: "test",
                genderPreference: "MALE",
                gender: "MALE",
                alcoholPreference: "VODKA",
                agePreferenceFrom: 3,
                agePreferenceTo: 7,
            }
        };

        const {data: {register}} = await mutate(mutation);

        expect(register.name).toEqual("kuba4");
        expect(register.email).toEqual("Jacek@1112");
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

    test('Gender preference is null test', async () => {
        const mutation =  {
            mutation: REGISTER,
            variables: {
                name: "kuba4",
                email: "Jacek@1112",
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

        const {data: {register}} = await mutate(mutation);

        expect(register.name).toEqual("kuba4");
        expect(register.email).toEqual("Jacek@1112");
        expect(register.password).not.toEqual("lalala");
        expect(register.age).toEqual(10);
        expect(register.favoriteAlcoholName).toEqual("Harnas");
        expect(register.favoriteAlcoholType).toEqual("VODKA");
        expect(register.description).toEqual("test");
        expect(register.genderPreference).toEqual(null);
        expect(register.gender).toEqual("MALE");
        expect(register.alcoholPreference).toEqual("VODKA");
        expect(register.agePreferenceFrom).toEqual(3);
        expect(register.agePreferenceTo).toEqual(7);
    });

});
