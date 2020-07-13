const nameRegex = "@constraint(pattern: '^[a-zA-Z]*$', maxLength: 255)";
const urlRegex = "@constraint(pattern: '^https://[0-9a-zA-Z]*.com$', maxLength: 255)";
const ageConstraint  = "@constraint(pattern: '^[0-9]*$', min: 0, max: 120)";

const typeDefs = `
type User {
    name: String! ${nameRegex}
    image_url: String ${urlRegex}
    age: Int! ${ageConstraint}
    location: Point
    favoriteDrink: Drink!
    description: String!
    gender: Gender!
    genderPreference: Gender!
    drinkPreference: Drink!
    agePreference: Drink!
}

type Drink  {
    name: String
    type: DrinkCategory
}

enum DrinkCategory {
    Vodka
    Beer
    Wine
}

enum Gender {
    Male
    Female
}
`;

export { typeDefs };
