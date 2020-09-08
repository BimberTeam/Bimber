
export const Account = `
    type Account {
        id: ID!
        name: String!
        email: String!
        password: String!
        imageUrl: String
        token: String
        age: Int!
        friends: [Account!]! @relation(name: "FRIENDS", direction: "OUT")
        requestedFriends: [Account!]! @relation(name: "REQUESTED_FRIENDS", direction: "OUT")
        groupInvitations: [Account!]! @relation(name: "GROUP_INVITATION", direction: "OUT")
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
