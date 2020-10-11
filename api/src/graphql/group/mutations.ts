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
    swipe(id: ID!): String
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
                SET group.id = apoc.create.uuid()
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

    acceptPendingRequest(input: AcceptPendingRequestInput!): String
    @cypher(
        statement: """
        MATCH (a:Account{id: $input.pendingUserId})
        MATCH (g:Group{id: $input.groupId})
        CALL apoc.do.when(
            $distributionOfVotes >= 0.5,
            \\"
            CALL {
                MATCH ( (a)-[vf:VOTE_FAVOUR]-(g) )
                RETURN vf as result
                UNION ALL
                MATCH ( (a)-[va:VOTE_AGAINST]-(g) )
                RETURN va as result
                UNION ALL
                MATCH (a)-[p:PENDING]->(g)
                RETURN p as result
            }
            MERGE (a)-[:BELONGS_TO]->(g)
            DELETE result
            RETURN 'Added user to group!' as result
            \\",
            \\"
            MERGE (g)-[:VOTE_FAVOUR{id: $meId}]->(a)
            RETURN 'Voted successfully!' as result
            \\",
            {a:a, g:g, meId:$meId}
        ) YIELD value
        RETURN value.result
        """
    )

    rejectPendingRequest(input: RejectPendingRequestInput!): String
    @cypher(
        statement: """
        MATCH (a:Account{id: $input.pendingUserId})
        MATCH (g:Group{id: $input.groupId})
        CALL apoc.do.when(
            $distributionOfVotes > 0.5,
            \\"
            CALL {
                MATCH ( (a)-[vf:VOTE_FAVOUR]-(g) )
                RETURN vf as result
                UNION ALL
                MATCH ( (a)-[va:VOTE_AGAINST]-(g) )
                RETURN va as result
                UNION ALL
                MATCH (a)-[p:PENDING]->(g)
                RETURN p as result
            }
            DELETE result
            RETURN 'User deleted from pending' as result
            \\",
            \\"
            MERGE (g)-[:VOTE_AGAINST{id: $meId}]->(a)
            RETURN 'Voted successfully!' as result
            \\",
            {a:a, g:g, meId:$meId}
        ) YIELD value
        RETURN value.result
        """
    )
`;
