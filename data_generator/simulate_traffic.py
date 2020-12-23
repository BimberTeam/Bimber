from user import User
import random
import json
import sys

##
# this scripts could be called i.e. every day to simulate traffic in our app
# it loads already created users, adds some new and then perform:
# swipe, answearing friend requests, voting and sending messages for every user
##


def load_users():
    with open("db.json", "r") as db_file:
        users_json = json.load(db_file)
        users = list(map(lambda x: User.from_dict(x), users_json))
        for user in users:
            user.login()
        return users

def create_new_users(users, number):
    for _ in range(0, number):
        user = User()
        user.register()
        user.login()
        user.updateLocation()
        user.uploadImage()
        user.queryMe()
        users.append(user)
    return users

def swipe(users, probability, number):
    for user in users:
        suggestions = user.groupSuggestions(number, 500)
        for group in suggestions:
            if random.random() < probability:
                user.swipeToLike(group['id'])
            else:
                user.swipeToDislike(group['id'])

def answear_friend_requests(users, probability):
    for user in users:
        friends_requests = user.queryMe()['friendRequests']
        friends_requests = list(map(lambda x: x['id'], friends_requests))
        for friend in friends_requests:
            if random.random()<probability:
                user.acceptFriendRequest(friend)
            else:
                user.denyFriendRequest(friend)

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

def sendMessages(users):
    for user in users:
        groups = user.queryMe()['groups']
        groups_id = list(map(lambda x: x['id'], groups))
        for id in groups_id:
            user.sendChatMessage(id)

def dump_users(users):
    with open("db.json", "w") as db_file:
        db_file.write("[\n")
        for i, user in enumerate(users):
            db_file.write(json.dumps(user.queryMe(), indent=4))
            if i != len(users) -1:
                db_file.write(",\n")
        db_file.write("\n]")

def simulate(new_users, swipes):
    users = load_users()
    create_new_users(users, new_users)
    swipe(users, 0.7, swipes)
    answear_friend_requests(users, 0.7)
    acceptGroupsPendingUser(users, 0.5)
    denyGroupsPendingUser(users, 0.6)
    sendMessages(users)
    dump_users(users)


if __name__ == "__main__":
    args = sys.argv[1:]
    new_users=10
    swipes=50
    for i, arg in enumerate(args):
        if arg == "--users" and len(args) > i:
            new_users = int(args[i+1])
        if arg == "--swipes" and len(args) > i:
            swipes = int(args[i+1])
    simulate(new_users, swipes)
