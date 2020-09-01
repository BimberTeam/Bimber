export const UserInputs = `
enum drinkCategory {
    Vodka
    Beer
    Wine
}

input registerUserInput {
    name: String!
    email: String!
    password: String!
    imageUrl: String
    age: Int!
    location: Point
    favoriteDrinkName: String!
    favoriteDrinkCategory: drinkCategory!
    description: String!
    gender: Gender!
    genderPreference: Gender!
    drinkPreference: drinkCategory!
    agePreference: Int!
}

type limitedInfoAboutUser {
    name: String!
    email: String!
    imageUrl: String
    age: Int!
    favoriteDrinkName: String!
    favoriteDrinkCategory: DrinkCategory!
    description: String!
    gender: Gender!
    genderPreference: Gender!
    drinkPreference: DrinkCategory!
    agePreference: Int!
}
`;
