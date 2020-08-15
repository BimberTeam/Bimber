export const GroupMutations = `
    createGroup(userAId: Int!, userBId: Int!): String
    @cypher(
        statement: """
            MATCH(ua: User{id: $userAId})
            MATCH(ub: User{id: $userBId})
            CREATE(g: Group)
            SET g.id = id(g)
            SET g:TTL
            SET g.ttl = timestamp() + 3
            MERGE(ua)-[:BELONGS_TO]->(g)
            MERGE(ub)-[:BELONGS_TO]->(g)
            RETURN 'Group created!'
        """
    )

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

`;

export const UserInputs = `
`;
