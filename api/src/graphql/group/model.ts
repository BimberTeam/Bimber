export const Group = `
    type Group {
        id: ID!
        members: [User] @relation(name: "BELONGS_TO", direction: "IN")
        pendingMembers: [User] @relation(name: "PENDING", direction: "IN")
        requestedMembers: [User] @relation(name: "REQUESTED", direction: "IN")
        membersCount: Int
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(u:User)
            RETURN count(*)
        """
        )
        averageAge: Float
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(u:User)
            RETURN coalesce(avg(u.age), 0.0)
        """
        )
        averageLocation: Coords
        @cypher(
        statement: """
            MATCH (this)<-[:BELONGS_TO]-(u:User)
            RETURN {
                longitude: coalesce(avg(u.latestLocation.longitude), 0.0),
                latitude: coalesce(avg(u.latestLocation.latitude), 0.0)
            }
        """
        )
    }`;
