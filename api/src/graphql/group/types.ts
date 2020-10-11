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
        membersCount: Int
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
            RETURN coalesce(avg(a.age), 0.0)
        """
        )
        averageLocation: Coords
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(a:Account)
            RETURN {
                longitude: coalesce(avg(a.latestLocation.longitude), 0.0),
                latitude: coalesce(avg(a.latestLocation.latitude), 0.0)
            }
        """
        )
    }`;
