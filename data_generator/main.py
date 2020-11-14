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
    for user in users:
        for _ in range(int(probability*len(users))):
            friend = random.choice(users)
            if(user != friend):
                friend.addFriend(user.id)

    for user in users:
        friends_requests = user.queryMe()['me']['friendRequests']
        for _ in range(int(probability*len(friends_requests))):
            friend = random.sample(friends_requests, 1)
            user.acceptFriendRequest(friend[0])

def main():
    users = create_users(5)
    add_users_to_friends(users, 0.5)
    users[0].createGroupFromFriends()
    for user in users:
        user.acceptAllGroupRequests()


if __name__ == "__main__":
    main()
