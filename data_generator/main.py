from user import User


def create_users(number):
    users = []
    for _ in range(0, number):
        user = User()
        user.register()
        user.login()
        user.updateLocation()
        users.append(user)
    return users


def add_users_to_friends(users):
    for i in range(0, len(users)):
        for j in range(i+1, len(users)):
            users[i].addFriend(users[j].id)
        users[i].acceptFriendRequests()




users = create_users(2)
add_users_to_friends(users)
users[0].createGroup()