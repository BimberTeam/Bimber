from gql import gql

register = gql("""
mutation Register(
    $name: String!,
    $email: String!,
    $password: String!,
    $age: Int!,
    $favoriteAlcoholName: String!,
    $favoriteAlcoholType: AlcoholType!,
    $description: String!,
    $gender: Gender!,
    $genderPreference: Gender,
    $alcoholPreference: AlcoholType!,
    $agePreferenceFrom: Int!,
    $agePreferenceTo: Int!
  ) {
  register(input: {
    name: $name,
    email: $email,
    password: $password,
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
