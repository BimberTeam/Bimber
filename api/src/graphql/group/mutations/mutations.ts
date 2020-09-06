export const GroupMutations = `
    """
        Parameters:\n
        id: Int - id of group which you want to join\n
        Description: \n
        If this group is one-person, this mutation will create new group
        and a relationship BELONGS_TO between you, the owner of swiped group and
        a group just created.\n
        But if this group have more than one member, will be send a request to join
        to this group (relationship REQUESTED). And you have to wait for group vote result.\n
    """
    swipe(id: Int): String
    @cypher(
        statement: """
        MATCH(g: Group {id: $id})
        CALL apoc.do.when(
            $membersCount = 0,
            \\"
                WITH $g AS g, $ttl AS ttl
                MATCH (g)<-[:OWNER]-(swipedUser:User)
                MATCH (meGroup: Group)-[b:OWNER]-(me:User {id: $meId})
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
                MATCH(me: User{id: $meId})
                MERGE(me)-[:REQUESTED]->(g)
                RETURN 'ok' AS res
            \\",
            {g:g, meId:$meId, ttl:ttl}
        ) YIELD value
        RETURN value.res
        """
    )

`;

export const UserInputs = `
`;
