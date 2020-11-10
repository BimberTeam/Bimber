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
  }
}
""")