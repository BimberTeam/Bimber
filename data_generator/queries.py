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

group = gql("""
query Group($id: ID!) {
  group(id: $id) {
    __typename
    id
    members{
       __typename
      id
      name
      email
      age
      favoriteAlcoholName
      favoriteAlcoholType
      description
      gender
      genderPreference
      alcoholPreference
      agePreferenceFrom
      agePreferenceTo
      latestLocation {
        latitude
        longitude
      }
    }
    averageAge
    averageLocation{
      latitude
      longitude
    }
  }
}
""")