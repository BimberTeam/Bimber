from user import User
import random

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
    sended_requests = dict()
    for user in users:
        sended_requests[user.id] = set()
        for _ in range(int(probability*len(users))):
            friend = random.choice(users)
            sended_requests[user.id].add(friend.id)
            friend.addFriend(user.id)
    for user in users:
        friends_requests = sended_requests[user.id]
        for _ in range(int(probability*len(friends_requests))):
            friend = random.sample(friends_requests, 1)
            user.acceptFriendRequest(friend[0])




users = create_users(5)
add_users_to_friends(users, 0.5)
users[0].createGroupFromFriends()