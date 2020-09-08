export const AccountInputs = `
input RegisterAccountInput {
    name: String!
    email: String!
    password: String!
    imageUrl: String
    age: Int!
    latestLocation: Point
    favoriteAlcoholName: String!
    favoriteAlcoholType: AlcoholType!
    description: String!
    gender: Gender!
    genderPreference: Gender!
    alcoholPreference: AlcoholType!
    agePreference: Int!
}

type User {
    name: String!
    email: String!
    imageUrl: String
    age: Int!
    favoriteAlcoholName: String!
    favoriteAlcoholType: AlcoholType!
    description: String!
    gender: Gender!
    genderPreference: Gender!
    alcoholPreference: AlcoholType!
    agePreference: Int!
}
`;
