from user import User
import random
import json
import sys
import pathlib

##
# this script allows to generate data for empty database
##

def create_users(number):
    users = []
    for _ in range(0, number):
        user = User()
        user.register()
        user.login()
        user.uploadImage()
        users.append(user)
    return users

def swipe(users, probability, number):
    for user in users:
        suggestions = user.groupSuggestions(number, 500000)
        for group in suggestions:
            if random.random() < probability:
                user.swipeToLike(group['id'])
            else:
                user.swipeToDislike(group['id'])

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
    path = pathlib.Path(__file__).parent.absolute()
    with open(str(path) + "/db.json", "w") as db_file:
        db_file.write("[\n")
        for i, user in enumerate(users):
            db_file.write(json.dumps(user.queryMe(), indent=4))
            if i != len(users) -1:
                db_file.write(",\n")
        db_file.write("\n]")

def generate(number):
    users = create_users(number)
    swipe(users, 0.7, int(number/2))
    add_users_to_friends(users, 0.3)
    createGroupsFromRandomFriends(users, 0.6)
    acceptGroupsPendingUser(users, 0.5)
    denyGroupsPendingUser(users, 0.6)
    generateMessages(users, 3)
    dump_users(users)


if __name__ == "__main__":
    args = sys.argv[1:]
    number = 10
    for i, arg in enumerate(args):
        if arg == "--users" and len(args) > i:
            number = int(args[i+1])
            break
    generate(number)
