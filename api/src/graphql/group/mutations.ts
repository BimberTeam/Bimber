const addedUserToGroup = "'Użytkownik został dodany do grupy!";
const voted = "'Głos został oddany!'";
const deletedUserFromPending = "'Użytkownik został usunięty z listy oczekujących na dołcząenie do podanej grupy!'";

const createdNewGroup = "'Utworzono nową grupę !'";
const requestedToJoinToGroup = "'Wysłano prośbę o dołączenię do grupy !'"

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
    swipe(id: ID!): Message
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
                RETURN {status: 'OK', message: ${createdNewGroup}} as result
            \\",
            \\"
                MATCH(me: Account{id: $meId})
                MERGE(me)-[:PENDING]->(g)
                RETURN {status: 'OK', message: ${requestedToJoinToGroup}} as result
            \\",
            {g:g, meId:$meId, ttl:ttl}
        ) YIELD value
        RETURN value.result
        """
    )

    acceptPendingRequest(input: AcceptPendingRequestInput!): Message
    @cypher(
        statement: """
        MATCH (a:Account{id: $input.userId})
        MATCH (g:Group{id: $input.groupId})
        CALL apoc.do.when(
            $distributionOfVotes >= 0.5,
            \\"
            CALL {
                MATCH ( (a)-[vf:VOTE_IN_FAVOUR]-(g) )
                RETURN vf as result
                UNION ALL
                MATCH ( (a)-[va:VOTE_AGAINST]-(g) )
                RETURN va as result
                UNION ALL
                MATCH ( (a)-[p:PENDING]->(g) )
                RETURN p as result
            }
            MERGE (a)-[:BELONGS_TO]->(g)
            DELETE result
            RETURN {status: 'OK', message: ${addedUserToGroup}} as result
            \\",
            \\"
            MERGE (g)-[:VOTE_IN_FAVOUR{id: $meId}]->(a)
            RETURN {status: 'OK', message: ${voted}} as result
            \\",
            {a:a, g:g, meId:$meId}
        ) YIELD value
        RETURN value.result
        """
    )

    rejectPendingRequest(input: RejectPendingRequestInput!): Message
    @cypher(
        statement: """
        MATCH (a:Account{id: $input.userId})
        MATCH (g:Group{id: $input.groupId})
        CALL apoc.do.when(
            $distributionOfVotes > 0.5,
            \\"
            CALL {
                MATCH ( (a)-[vf:VOTE_IN_FAVOUR]-(g) )
                RETURN vf as result
                UNION ALL
                MATCH ( (a)-[va:VOTE_AGAINST]-(g) )
                RETURN va as result
                UNION ALL
                MATCH ( (a)-[p:PENDING]->(g) )
                RETURN p as result
            }
            DELETE result
            RETURN {status: 'OK', message: ${deletedUserFromPending}} as result
            \\",
            \\"
            MERGE (g)-[:VOTE_AGAINST{id: $meId}]->(a)
            RETURN {status: 'OK', message: ${voted}} as result
            \\",
            {a:a, g:g, meId:$meId}
        ) YIELD value
        RETURN value.result
        """
    )
`;
