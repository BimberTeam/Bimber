export const GroupTypes = `
    type Group {
        id: ID!
        members: [User]
        @cypher(
            statement: """
                MATCH (this)<-[:BELONGS_TO]-(a:Account)
                RETURN a
            """
        )
        pendingMembers: [User]
        @cypher(
            statement: """
                MATCH (this)<-[:PENDING]-(a:Account)
                RETURN a
            """
        )
        averageAge: Float
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(a:Account)
            RETURN avg(a.age) + 0.000000001
        """
        )
        averageLocation: Coords
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(a:Account)
            RETURN {
                longitude: avg(a.latestLocation.longitude) + 0.000000001 ,
                latitude: avg(a.latestLocation.latitude) + 0.000000001
            }
        """
        ),
    },

    type GroupInfoPayload {
        id: ID!
        friendCandidates: [User]
        members: [User]
        pendingMembers: [User]
        averageAge: Float
        averageLocation: Coords
    },
`;
