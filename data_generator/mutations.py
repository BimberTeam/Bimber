from gql import gql

register = gql("""
mutation Register(
    $name: String!,
    $email: String!,
    $password: String!,
    $latitude: Float!,
    $longitude: Float!,
    $age: Int!,
    $favoriteAlcoholName: String!,
    $favoriteAlcoholType: AlcoholType!,
    $description: String!,
    $gender: Gender!,
    $genderPreference: Gender,
    $alcoholPreference: AlcoholType!,
    $agePreferenceFrom: Int!,
    $agePreferenceTo: Int!,
  ) {
  register(input: {
    name: $name,
    email: $email,
    password: $password,
    latitude: $latitude,
    longitude: $longitude,
    age: $age,
    favoriteAlcoholName: $favoriteAlcoholName,
    favoriteAlcoholType: $favoriteAlcoholType,
    description: $description,
    gender: $gender,
    genderPreference: $genderPreference,
    alcoholPreference: $alcoholPreference,
    agePreferenceFrom: $agePreferenceFrom,
    agePreferenceTo: $agePreferenceTo,
  }) {
    id
  }
}
""")

login = gql("""
mutation Login($email: String!, $password: String!) {
  login(input: {
    email: $email,
    password: $password
  }) {
    token
  }
}
""")

acceptFriendRequest = gql("""
mutation AcceptFriendRequest($input: FriendInput!){
    acceptFriendRequest(input: $input) {
      message
      status
    }
  }
""")

denyFriendRequest = gql("""
mutation DenyFriendRequest($input: FriendInput!){
    denyFriendRequest(input: $input) {
      message
      status
    }
}
""")

removeFriend = gql("""
mutation RemoveFriend($input: FriendInput!){
    removeFriend(input: $input) {
      message
      status
    }
  }
""")

addFriend = gql("""
mutation SendFriendRequest($input: FriendInput!){
    sendFriendRequest(input: $input) {
      message
      status
    }
  }
""")


updateLocation = gql("""
mutation UpdateLocation($latitude: Float, $longitude: Float){
  updateLocation(input: {
    latitude: $latitude,
    longitude: $longitude}){
      message
      status
    }
}
""")

acceptGroupRequest = gql("""
mutation AcceptGroupInvitation($input: AcceptGroupInvitationInput!){
   acceptGroupInvitation(input: $input) {
      message
      status
    }
  }
""")

rejectGroupRequest = gql("""
mutation RejectGroupInvitation($input: RejectGroupInvitationInput!){
    rejectGroupInvitation(input: $input) {
      message
      status
    }
}
""")

createGroup = gql("""
mutation CreateGroup($usersId: [ID!]!){
    createGroup(input: {
    usersId: $usersId
    }) {
      message
      status
    }
}
""")

addToGroup = gql("""
mutation AddFriendToGroup($groupId: ID!, $friendId: ID!){
    addFriendToGroup(input: {
    friendId: $friendId,
    groupId: $groupId
    }) {
      message
      status
    }
}
""")

voteFor = gql("""
mutation AcceptGroupPendingUser($groupId: ID!, $userId: ID!){
    acceptGroupPendingUser(input: {
    userId: $userId,
    groupId: $groupId
    }) {
      message
      status
    }
}
""")

voteAgainst = gql("""
mutation RejectGroupPendingUser($groupId: ID!, $userId: ID!){
    rejectGroupPendingUser(input: {
    userId: $userId,
    groupId: $groupId
    }) {
      message
      status
    }
}
""")

sendChatMessage = gql("""
mutation SendChatMessage($groupId: ID!, $message: String!) {
  sendChatMessage(input: {
    groupId: $groupId, message: $message
  }) {
    status
    message
  }
}
""")

swipeToLike = gql("""
mutation SwipeToLike($groupId: ID!){
    swipeToLike(input: {
    groupId: $groupId
    }) {
      message
      status
    }
}
""")

swipeToDislike = gql("""
mutation SwipeToDislike($groupId: ID!){
    swipeToDislike(input: {
    groupId: $groupId
    }) {
      message
      status
    }
}
""")