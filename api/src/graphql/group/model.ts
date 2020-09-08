export const Group = `
    type Group {
        id: ID!
        members: [Account] @relation(name: "BELONGS_TO", direction: "IN")
        pendingMembers: [Account] @relation(name: "PENDING", direction: "IN")
        requestedMembers: [Account] @relation(name: "REQUESTED", direction: "IN")
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
