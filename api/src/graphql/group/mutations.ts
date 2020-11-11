import { singleQuote } from "./../common/helper";

const addToGroupSuccess = singleQuote("Użytkownik został dodany do grupy!");
const votingSuccess = singleQuote("Głos został oddany!");
const deletedUserJoinRequestSuccess = singleQuote("Użytkownik został przegłosowany na jego niekorzyść, usunięto prośbę o dołączenie!");

const groupCreatedSuccess = singleQuote("Utworzono nową grupę!");
const requestedGroupJoinSuccess = singleQuote("Wysłano prośbę o dołączenię do grupy!");
const groupInvitationSentSuccess = singleQuote("Wysłano zaproszenie do grupy!");
const acceptGroupInvitationSuccess = singleQuote("Zaproszenie do grupy zostało zaakceptowane!");
const rejectGroupInvitationSuccess = singleQuote("Zaproszenie do grupy zostało usunięte!");
const swipeToDislikeSuccess = singleQuote("Podana grupa została zignorowana!");

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
    swipeToLike(input: SwipeInput!): Message
    @cypher(
        statement: """
        MATCH(g: Group {id: $input.groupId})
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

    swipeToDislike(input: SwipeInput!): Message
    @cypher(
        statement: """
        MATCH(g: Group {id: $input.groupId})
        MATCH(me:Account {id: $meId})
        MERGE(me)-[:DISLIKE]->(g)
        RETURN {status: 'OK', message: ${swipeToDislikeSuccess}}
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
                MATCH (a:Account{id: $input.userId})
                MATCH (g:Group{id: $input.groupId})
                MATCH ( (a)-[vf:VOTE_IN_FAVOUR]-(g) )
                RETURN vf as result
                UNION ALL
                MATCH (a:Account{id: $input.userId})
                MATCH (g:Group{id: $input.groupId})
                MATCH ( (a)-[va:VOTE_AGAINST]-(g) )
                RETURN va as result
                UNION ALL
                MATCH (a:Account{id: $input.userId})
                MATCH (g:Group{id: $input.groupId})
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
            {a:a, g:g, meId:$meId, input: input }
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

    createGroup(input: CreateGroupInput): Message
    @cypher(
        statement: """
            CALL {
                CREATE(g: Group)
                SET g.id = apoc.create.uuid()
                SET group:TTL
                SET group.ttl = timestamp() + toInteger(ttl)
                RETURN g
            }
            MATCH(me: Account{id: $meId})
            MATCH(users: Account) WHERE users.id IN $input.usersId
            MERGE(me)-[:BELONGS_TO]->(g)
            MERGE(users)-[:GROUP_INVITATION{inviterId: $meId}]->(g)
            RETURN {status: 'OK', message: ${groupCreatedSuccess}}
        """
    )

    addFriendToGroup(input: AddFriendToGroupInput): Message
    @cypher(
        statement: """
            MATCH(a: Account{id: $input.userId})
            MATCH(g: Group{id: $input.groupId})
            MERGE((a)-[:GROUP_INVITATION{inviterId: $meId}]->(g))
            RETURN {status: 'OK', message: ${groupInvitationSentSuccess}}
        """
    )

    acceptGroupInvitation(input: AcceptGroupInvitationInput): Message
    @cypher(
        statement: """
            CALL {
                MATCH(group: Group{id: $input.groupId})
                MATCH(group)-[:BELONGS_TO]-(members: Account)
                RETURN count(members) as groupMembers
            }
            MATCH(a: Account{id: $meId})
            MATCH(g: Group{id: $input.groupId})
            MATCH(a)-[gi:GROUP_INVITATION]->(g)
            CALL apoc.do.when(
                groupMembers < 3,
                \\"
                    MERGE( (a)-[:BELONGS_TO]->(g) )
                    DELETE gi
                    RETURN {status: 'OK', message: ${acceptGroupInvitationSuccess}} AS result
                \\",
                \\"
                    MERGE( (a)-[:PENDING]-(g) )
                    MERGE( (g)-[:VOTE_IN_FAVOUR{id: gi.inviterId}]->(a) )
                    DELETE gi
                    RETURN {status: 'OK', message: ${acceptGroupInvitationSuccess}} AS result
                \\",
                {a:a, g:g, groupMembers:groupMembers, gi:gi}
            ) YIELD value
            RETURN value.result
        """
    )

    rejectGroupInvitation(input: RejectGroupInvitationInput): Message
    @cypher(
        statement: """
            MATCH(a: Account{id: $meId})
            MATCH(g: Group{id: $input.groupId})
            MATCH(a)-[gi:GROUP_INVITATION]->(g)
            DELETE gi
            RETURN {status: 'OK', message: ${rejectGroupInvitationSuccess}}
        """
    )
`;
