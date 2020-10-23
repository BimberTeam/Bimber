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
        agePreferenceFrom: Int!
        agePreferenceTo: Int!
    }

    input UpdateAccountInput {
        name: String
        email: String
        password: String
        age: Int
        favoriteAlcoholName: String
        favoriteAlcoholType: AlcoholType
        description: String
        gender: Gender
        genderPreference: Gender
        alcoholPreference: AlcoholType
        agePreferenceFrom: Int
        agePreferenceTo: Int
    }
`;
