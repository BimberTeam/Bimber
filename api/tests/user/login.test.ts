import { mockedUsers } from './mock';
import { REGISTER, LOGIN } from './mutations';
import { prepareDbForTests, clearDatabase } from './../../src/app';

export const loginTests = (query, mutate) => {
    describe('Login mutation', () => {

        const registerInput = {
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

        test("should validate that user exists", async () => {
            const loginInput = {
                variables: {
                    email: "Jacek@111",
                    password: "lalala"
                }
              };

            const {errors: [error]} = await mutate(LOGIN, loginInput);
            const {code} = error.extensions

            expect(error.message).toEqual("\'Podany email nie istnieje!\'");
            expect(code).toEqual('200');
        });

        test("should fail on incorrect email", async () => {
            await mutate(REGISTER, registerInput);

            const incorrectEmailInput =  {
                variables: {
                    email: "incorrect@email.com",
                    password: "lalala"
                }
            };

            const {errors: [error]} = await mutate(LOGIN, incorrectEmailInput);
            const {code} = error.extensions

            expect(error.message).toEqual("\'Podany email nie istnieje!\'");
            expect(code).toEqual('200');
        });

        test("should fail on incorrect password", async () => {
            await mutate(REGISTER, registerInput);

            const incorrectPasswordInput =  {
                variables: {
                    email: "Jacek@111",
                    password: "incorrectPassword"
                }
            };

            const {errors: [error]} = await mutate(LOGIN, incorrectPasswordInput);
            const {code} = error.extensions

            expect(error.message).toEqual("\'Wprowadzono niepoprawne hasło!\'");
            expect(code).toEqual('200');
        });

        test("should succeed on valid input data", async () => {
            await mutate(REGISTER, registerInput);

            const correctLoginInput =  {
                variables: {
                    email: "Jacek@111",
                    password: "lalala"
                }
            };

            const {data: {login}} = await mutate(LOGIN, correctLoginInput);

            expect(login.token).not.toBeNull();
            expect(login.token).not.toBeUndefined();
        });
    })
};