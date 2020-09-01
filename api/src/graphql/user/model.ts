
export const User = `
    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
        imageUrl: String
        token: String
        age: Int!
        friends: [User!]! @relation(name: "FRIENDS", direction: "OUT")
        requestedFriends: [User!]! @relation(name: "REQUESTED_FRIENDS", direction: "OUT")
        groupInvitations: [User!]! @relation(name: "GROUP_INVITATION", direction: "OUT")
        location: Point
        favoriteDrinkName: String!
        favoriteDrinkCategory: DrinkCategory!
        description: String!
        gender: Gender!
        genderPreference: Gender!
        drinkPreference: DrinkCategory!
        agePreference: Int!
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

    type Cords{
        longitude: Float,
        latitude: Float
    }
`;
