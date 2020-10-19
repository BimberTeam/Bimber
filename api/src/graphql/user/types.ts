
export const AccountTypes = `
    type Account {
        id: ID!
        name: String!
        email: String!
        password: String!
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
        agePreferenceFrom: Int!
        agePreferenceTo: Int!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int!
        favoriteAlcoholName: String!
        favoriteAlcoholType: AlcoholType!
        description: String!
        latestLocation: Point
        gender: Gender!
        genderPreference: Gender!
        alcoholPreference: AlcoholType!
        agePreferenceFrom: Int!
        agePreferenceTo: Int!
    }

    enum AlcoholType {
        VODKA
        BEER
        WINE
    }

    enum Gender {
        MALE
        FEMALE
    }

    type Coords{
        longitude: Float,
        latitude: Float
    }

    type PendingMemberListPayload{
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
        votesAgainst: Int!
        votesInFavour: Int!
        groupCount: Int!
    }

    type LoginPayload {
        token: String!
    }
`;
