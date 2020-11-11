from gql import gql

me = gql("""
query Me {
  me {
    __typename
    id
    email
    name
    description
    age
    gender
    favoriteAlcoholName
    favoriteAlcoholType
    genderPreference
    alcoholPreference
    agePreferenceFrom
    agePreferenceTo
    friends {
      id
      name
    }
    friendRequests {
      id
      name
    }
    groups {
      id
    }
    groupInvitations {
      id
    }
    latestLocation {
      latitude
      longitude
    }
  }
}
""")