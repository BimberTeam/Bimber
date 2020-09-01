export const GroupMutations = `
    addUserToGroup(userID: Int!, groupID: Int!): String
    @cypher(
        statement: """
        MATCH(u: User {id: $userID})
        MATCH(g: Group {id: $groupID})
        MERGE(u)-[:BELONGS_TO]->(g)
        ON CREATE SET u.is_exist = true
        ON MATCH SET u.is_exist = false
        WITH u, (
            CASE u.is_exist
            WHEN true THEN 'Ok'
            ELSE 'This user already belongs to this group'
            END
        ) AS result
        REMOVE u.is_exist
        RETURN result
        """
    )

    swipe(id: Int): String
    @cypher(
        statement: """
        MATCH(g: Group {id: $id})
        CALL apoc.do.when(
            $memberQuantity = 0,
            \\"
                WITH $g AS g, $ttl AS ttl
                MATCH (g)<-[:OWNER]-(swipedUser:User)
                MATCH (meGroup: Group)-[b:OWNER]-(me:User {id: $meID})
                MATCH (swipedUser)-[pen:PENDING]->(meGroup)
                DELETE pen
                CREATE(group: Group)
                SET group.id = id(group)
                SET group:TTL
                SET group.ttl = timestamp() + toInteger(ttl)
                MERGE(me)-[:BELONGS_TO]->(group)
                MERGE(swipedUser)-[:BELONGS_TO]->(group)
                RETURN 'ok' AS res
            \\",
            \\"
                MATCH(me: User{id: $meID})
                MERGE(me)-[:REQUESTED]->(g)
                RETURN 'ok' AS res
            \\",
            {g:g, meID:$meID, ttl:ttl}
        ) YIELD value
        RETURN value.res
        """
    )

`;

export const UserInputs = `
`;
