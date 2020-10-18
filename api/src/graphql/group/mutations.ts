import { singleQuote } from "./../common/helper";

const addToGroupSuccess = singleQuote("Użytkownik został dodany do grupy!");
const votingSuccess = singleQuote("Głos został oddany!");
const deletedUserJoinRequestSuccess = singleQuote("Użytkownik został przegłosowany na jego niekorzyść, usunięto prośbę o dołączenie!");

const groupCreatedSuccess = singleQuote("Utworzono nową grupę !");
const requestedGroupJoinSuccess = singleQuote("Wysłano prośbę o dołączenię do grupy !");

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
            $groupMembers = 0,
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
                RETURN {status: 'OK', message: ${groupCreatedSuccess}} as result
            \\",
            \\"
                MATCH(me: Account{id: $meId})
                MERGE(me)-[:PENDING]->(g)
                RETURN {status: 'OK', message: ${requestedGroupJoinSuccess}} as result
            \\",
            {g:g, meId:$meId, ttl:ttl}
        ) YIELD value
        RETURN value.result
        """
    )

    acceptGroupPendingUser(input: AcceptPendingRequestInput!): Message
    @cypher(
        statement: """
        MATCH (a:Account{id: $input.userId})
        MATCH (g:Group{id: $input.groupId})
        CALL apoc.do.when(
            $votesDistribution >= 0.5,
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
            RETURN {status: 'OK', message: ${addToGroupSuccess}} as result
            \\",
            \\"
            MERGE (g)-[:VOTE_IN_FAVOUR{id: $meId}]->(a)
            RETURN {status: 'OK', message: ${votingSuccess}} as result
            \\",
            {a:a, g:g, meId:$meId}
        ) YIELD value
        RETURN value.result
        """
    )

    rejectGroupPendingUser(input: RejectPendingRequestInput!): Message
    @cypher(
        statement: """
        MATCH (a:Account{id: $input.userId})
        MATCH (g:Group{id: $input.groupId})
        CALL apoc.do.when(
            $votesDistribution > 0.5,
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
            RETURN {status: 'OK', message: ${deletedUserJoinRequestSuccess}} as result
            \\",
            \\"
            MERGE (g)-[:VOTE_AGAINST{id: $meId}]->(a)
            RETURN {status: 'OK', message: ${votingSuccess}} as result
            \\",
            {a:a, g:g, meId:$meId}
        ) YIELD value
        RETURN value.result
        """
    )
`;
