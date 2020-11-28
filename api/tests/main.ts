import { updateLocationTest } from './user/updateLocation.test';
import { suggestGroupTest } from './group/suggestGroup.test';
import { rejectGroupInvitationTest } from './group/rejectGroupInvitation.test';
import { acceptGroupInvitationTest } from './group/acceptGroupInvitation.test';
import { createGroupTest } from './group/createGroup.test';
import { removeFriendTest } from './user/removeFriend.test';
import { denyFriendRequestTest } from './user/denyFriendRequest.test';
import { acceptFriendRequestTest } from './user/acceptFriendRequest.test';
import { addFriendTest } from './user/addFriend.test';
import { server } from './../src/app';
import { meTests } from './user/me.test';
import { loginTests } from './user/login.test';
import { registerTests } from './user/register.test';
import { createTestClient } from 'apollo-server-integration-testing';

describe("Backend tests :" , () => {
    const {query, mutate, setOptions} = createTestClient({
        apolloServer: server
    });

    beforeAll(() => {
        setOptions({
            request: {
                headers: {
                }
            },
        });
    });

    loginTests(query, mutate);
    registerTests(query, mutate);
    meTests(query, mutate, setOptions);
    addFriendTest(query, mutate, setOptions);
    acceptFriendRequestTest(query, mutate, setOptions);
    denyFriendRequestTest(query, mutate, setOptions);
    removeFriendTest(query, mutate, setOptions);
    createGroupTest(query, mutate, setOptions);
    acceptGroupInvitationTest(query, mutate, setOptions);
    rejectGroupInvitationTest(query, mutate, setOptions);
    updateLocationTest(query, mutate, setOptions);
    suggestGroupTest(query, mutate, setOptions);
})