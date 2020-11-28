import { SUGGEST_GROUP } from './queries';
import { registerUser, invalidTokenTest, login, setToken, deleteSingleQuote, meQuery, replyToFriendRequestMutation } from './../common/helper';
import { prepareDbForTests, clearDatabase } from './../../src/app';
import {userNotFoundError, lackingFriendRequestError} from './../../src/graphql/user/common/friendRequest';
import {friendAddedSuccess} from './../../src/graphql/user/mutations';

export const suggestGroupTest = (query, mutate, setOptions) => {
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

        invalidTokenTest(SUGGEST_GROUP, mutate, setOptions);

    });
};