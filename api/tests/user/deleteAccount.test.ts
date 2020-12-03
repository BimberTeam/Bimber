import { invalidTokenTest, registerUser, login, deleteSingleQuote, setToken, createUserAndAddToFriend } from './../common/helper';
import { mockedUsers } from './mock';
import { DELETE_ACCOUNT } from './mutations';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import { deleteAccountSuccess } from './../../src/graphql/user/mutations';

export const deleteAccountTest = (query, mutate, setOptions) => {
    describe('DeleteAccount mutation', () => {
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

        invalidTokenTest(DELETE_ACCOUNT, mutate, setOptions);

        test("should succeed on valid data", async () => {
            const [me, friend] = mockedUsers;
            const meId:string = await registerUser(mutate, me);
            await login(mutate, me, setOptions);
            await createUserAndAddToFriend(meId, me, friend, mutate, setOptions);

            const {data: {deleteAccount}}  = await mutate(DELETE_ACCOUNT);

            expect(deleteAccount.message).toEqual(deleteSingleQuote(deleteAccountSuccess));
            expect(deleteAccount.status).toEqual('OK');
        });
    });
}