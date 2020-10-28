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
        requestedMembers: [User]
        @cypher(
            statement: """
                MATCH (this)<-[:REQUESTED]-(a:Account)
                RETURN a
            """
        )
        groupMembers: Int
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(a:Account)
            RETURN count(*)
        """
        )
        averageAge: Float
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(a:Account)
            RETURN avg(a.age)
        """
        )
        averageLocation: Coords
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(a:Account)
            RETURN {
                longitude: avg(a.latestLocation.longitude),
                latitude: avg(a.latestLocation.latitude)
            }
        """
        )

    }`;
