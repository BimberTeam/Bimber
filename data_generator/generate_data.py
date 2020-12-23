from user import User
import random
import json

def create_users(number):
    users = []
    for _ in range(0, number):
        user = User()
        user.register()
        user.login()
        user.updateLocation()
        user.uploadImage()
        user.queryMe()
        users.append(user)
    return users

def add_users_to_friends(users, probability):
    for user in users:
        for friend in users:
            if user != friend and random.random() < probability:
                friend.addFriend(user.id)
    for user in users:
        friends_requests = user.queryMe()['friendRequests']
        friends_requests = list(map(lambda x: x['id'], friends_requests))
        for friend in friends_requests:
            user.acceptFriendRequest(friend)

def createGroupsFromRandomFriends(users, probability):
    for user in users:
        friends = user.queryMe()['friends']
        friends_id = list(map(lambda x: x['id'], friends))
        ids = random.sample(friends_id, int(len(friends_id)*probability))
        user.createGroup(ids)
    for user in users:
        # no need for random choice, cause only first two users will join group and rest will become candidates
        groups = user.queryMe()['groupInvitations']
        for group in groups:
            user.acceptGroupRequest(group['id'])

def acceptGroupsPendingUser(users, probability):
    for user in users:
        groups = user.queryMe()['groups']
        for group in groups:
            group_canditdates = user.showGroupCandidate(group['id'])
            for candidate in group_canditdates:
                if random.random() <= probability:
                    user.vote_for(group['id'], candidate['id'])

def denyGroupsPendingUser(users, probability):
    for user in users:
        groups = user.queryMe()['groups']
        for group in groups:
            group_canditdates = user.showGroupCandidate(group['id'])
            for candidate in group_canditdates:
                if random.random() <= probability:
                    user.vote_against(group['id'], candidate['id'])

def generateMessages(users, number):
    for user in users:
        groups = user.queryMe()['groups']
        groups_id = list(map(lambda x: x['id'], groups))
        for id in groups_id:
            for _ in range(number):
                user.sendChatMessage(id)

def dump_users(users):
    with open("db.json", "w") as db_file:
        db_file.write("[\n")
        for i, user in enumerate(users):
            db_file.write(json.dumps(user.queryMe(), indent=4))
            if i != len(users) -1:
                db_file.write(",\n")
        db_file.write("\n]")

def main():
    users = create_users(10)
    add_users_to_friends(users, 0.7)
    createGroupsFromRandomFriends(users, 0.6)
    acceptGroupsPendingUser(users, 0.5)
    denyGroupsPendingUser(users, 0.3)
    generateMessages(users, 3)
    dump_users(users)


if __name__ == "__main__":
    main()
