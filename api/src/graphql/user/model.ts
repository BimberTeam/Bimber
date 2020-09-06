
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
        latestLocation: Point
        favoriteAlcoholName: String!
        favoriteAlcoholType: AlcoholType!
        description: String!
        gender: Gender!
        genderPreference: Gender!
        alcoholPreference: AlcoholType!
        agePreference: Int!
    }

    enum AlcoholType {
        Vodka
        Beer
        Wine
    }

    enum Gender {
        Male
        Female
    }

    type Coords{
        longitude: Float,
        latitude: Float
    }
`;
