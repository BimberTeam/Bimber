
export const AccountTypes = `
    type Account {
        id: ID!
        name: String!
        email: String!
        password: String!
        token: String
        age: Int!
        friends: [User!]!
        @cypher(
            statement: """
                MATCH (this)-[:FRIENDS]->(a:Account)
                RETURN a
            """
        )
        friendRequests: [User!]!
        @cypher(
            statement: """
                MATCH (this)<-[:REQUESTED_FRIENDS]-(a:Account)
                RETURN a
            """
        )
        groups: [Group!]!
        @cypher(
            statement: """
                MATCH (this)-[:BELONGS_TO]->(g:Group)
                RETURN g
            """
        )
        groupInvitations: [Group!]!
        @cypher(
            statement: """
                MATCH (this)-[:GROUP_INVITATION]->(g:Group)
                RETURN g
            """
        )
        latestLocation: Point
        favoriteAlcoholName: String!
        favoriteAlcoholType: AlcoholType!
        description: String!
        gender: Gender!
        genderPreference: Gender
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
        genderPreference: Gender
        alcoholPreference: AlcoholType!
        agePreferenceFrom: Int!
        agePreferenceTo: Int!
    }

    enum AlcoholType {
        VODKA
        BEER
        WINE
        OTHER
    }

    enum Gender {
        MALE
        FEMALE
    }

    type Coords{
        longitude: Float,
        latitude: Float
    }

    type GroupCandidatesPayload{
        user: User!
        votesAgainst: Int!
        votesInFavour: Int!
        groupCount: Int!
    }

    type LoginPayload {
        token: String!
    }
`;
