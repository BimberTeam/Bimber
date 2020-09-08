export const GroupMutations = `
    """
        Parameters:\n
        id: Int - id of group which you want to join\n
        Description: \n
        If requested group consists of a single person new group will be created containing both:
        - current user
        - requested group's owner

        Otherwise new relationship ('REQUESTED') will be created between the caller and requested group.
        Caller will be pending until accepted by majority of the group members.
    """
    swipe(id: Int): String
    @cypher(
        statement: """
        MATCH(g: Group {id: $id})
        CALL apoc.do.when(
            $membersCount = 0,
            \\"
                WITH $g AS g, $ttl AS ttl
                MATCH (g)<-[:OWNER]-(swipedAccount:Account)
                MATCH (meGroup: Group)-[b:OWNER]-(me:Account {id: $meId})
                MATCH (swipedAccount)-[pen:PENDING]->(meGroup)
                DELETE pen
                CREATE(group: Group)
                SET group.id = id(group)
                SET group:TTL
                SET group.ttl = timestamp() + toInteger(ttl)
                MERGE(me)-[:BELONGS_TO]->(group)
                MERGE(swipedAccount)-[:BELONGS_TO]->(group)
                RETURN 'Sent swipe request!' AS res
            \\",
            \\"
                MATCH(me: Account{id: $meId})
                MERGE(me)-[:REQUESTED]->(g)
                RETURN 'ok!' AS res
            \\",
            {g:g, meId:$meId, ttl:ttl}
        ) YIELD value
        RETURN value.res
        """
    )

`;
