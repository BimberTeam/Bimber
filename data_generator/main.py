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
        friends_requests = user.queryMe()['me']['friendRequests']
        friends_requests = list(map(lambda x: x['id'], friends_requests))
        for friend_id in friends_requests:
            if random.random() < probability:
                user.acceptFriendRequest(friend)

def createGroupsFromRandomFriends(users, probability):
    for user in users:
        friends = user.queryMe()['me']['friends']
        friends_id = list(map(lambda x: x['id'], friends))
        ids = random.sample(friends_id, int(len(friends_id)*probability))
        user.createGroup(ids)
    for user in users:
        # no need for random choice, cause only first two users will join group and rest will become candidates
        user.acceptAllGroupRequests()

def dump_users(users):
    with open("db.json", "w") as db_file:
        db_file.write("[\n")
        for i, user in enumerate(users):
            db_file.write(json.dumps(user.queryMe(), indent=4))
            if i != len(users) -1:
                db_file.write(",\n")
        db_file.write("\n]")
       


def main():
    users = create_users(5)
    add_users_to_friends(users, 0.9)
    createGroupsFromRandomFriends(users, 1)
    dump_users(users)


if __name__ == "__main__":
    main()
