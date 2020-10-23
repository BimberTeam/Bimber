import { singleQuote } from "./../common/helper";

// accept friend request messages
const friendAddedSuccess = singleQuote("Zaakceptowano zaproszenie do znajomych!");
const friendAlreadyExistsError = singleQuote("Jesteście już znajomymi!");
const friendMissingRequestError = singleQuote("Nie dostałeś takiego zaproszenia!");
const friendDeletedSuccess = singleQuote("Usunięto znajomego!");

const friendshipRequestSentSuccess = singleQuote("Wysłano zaproszenie do znajomych!");
const friendshipRequestDeniedSuccess = singleQuote("Odrzucono prośbę o dołączenie do znajomych!");

const deleteAccountSuccess = singleQuote("Konto zostało usunięte!");

export const AccountMutations = `
    acceptFriendRequest(friendId: ID!): Message
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $friendId })
        OPTIONAL MATCH(a)-[fa:REQUESTED_FRIENDS]->(b)
        OPTIONAL MATCH(b)-[fb:REQUESTED_FRIENDS]->(a)
        CALL apoc.do.when(
            EXISTS( (b)-[:REQUESTED_FRIENDS]->(a)  ) = true,
            \\"
            DELETE fa, fb
            MERGE(a)-[:FRIENDS]->(b)
            MERGE(b)-[:FRIENDS]->(a)
            ON CREATE SET a.is_exist = true
            ON MATCH SET a.is_exist = false
            WITH a, (
                CASE a.is_exist
                WHEN true THEN {status: 'OK', message: ${friendAddedSuccess}}
                ELSE {status: 'ERROR', message: ${friendAlreadyExistsError}}
                END
            ) AS res
            REMOVE a.is_exist
            RETURN res
            \\",
            \\"
            RETURN {status: 'ERROR', message: ${friendMissingRequestError}} AS res
            \\",
            {a:a, b:b, fa:fa, fb:fb}
        ) YIELD value
        RETURN value.res
    """
    )

    removeFriend(friendId: ID!): Message
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $friendId })
        OPTIONAL MATCH (a)-[fa:FRIENDS]->(b)
        OPTIONAL MATCH (b)-[fb:FRIENDS]->(a)
        DELETE fa, fb
        RETURN {status: 'OK', message: ${friendDeletedSuccess}}
    """
    )

    sendFriendRequest(friendId: ID!): Message
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $friendId })
        CALL apoc.do.case([
            EXISTS((a)-[:FRIENDS]->(b))=true OR EXISTS((b)-[:FRIENDS]->(a))=true,
                \\"RETURN {status: 'ERROR', message: ${friendAlreadyExistsError}} AS result\\",
            EXISTS((b)-[:REQUESTED_FRIENDS]->(a))=true,
                \\" WITH $a AS a, $b AS b
                OPTIONAL MATCH(a)-[fa:REQUESTED_FRIENDS]->(b)
                OPTIONAL MATCH(b)-[fb:REQUESTED_FRIENDS]->(a)
                DELETE fa, fb
                MERGE(a)-[:FRIENDS]->(b)
                MERGE(b)-[:FRIENDS]->(a)
                RETURN {status: 'OK', message: ${friendAddedSuccess}} AS result \\",
            EXISTS((b)-[:REQUESTED_FRIENDS]->(a))=false,
                \\"  WITH $a AS a, $b AS b
                MERGE(a)-[:REQUESTED_FRIENDS]->(b)
                ON CREATE SET a.is_exist = true
                ON MATCH SET a.is_exist = false
                WITH a, (
                    CASE a.is_exist
                    WHEN true THEN {status: 'OK', message: ${friendshipRequestSentSuccess}}
                    ELSE {status: 'ERROR', message: ${friendAlreadyExistsError}}
                    END
                ) AS result
                REMOVE a.is_exist
                RETURN result \\"
        ],
        '',
        {a:a, b:b}
        ) YIELD value
        RETURN value.result
    """
    )

    denyFriendRequest(userId: ID!): Message
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $userId })
        MATCH (a)-[f:REQUESTED_FRIENDS]->(b)
        DELETE f
        RETURN {status: 'OK', message: ${friendshipRequestDeniedSuccess}}
    """
    )

    updateAccount(account:UpdateAccountInput!): User
    @cypher(
        statement: """
            MATCH(a: Account { id: $meId })
            SET a += apoc.map.fromLists($keys,$values)
            RETURN a
        """
    )

    register(user: RegisterAccountInput): Account
    @cypher(
    statement: """
        CREATE (u:Account {
            name: $user.name,
            email: $user.email,
            password: $user.password,
            age: $user.age,
            latestLocation: $user.latestLocation,
            favoriteAlcoholName: $user.favoriteAlcoholName,
            favoriteAlcoholType: $user.favoriteAlcoholType,
            description: $user.description,
            gender: $user.gender,
            genderPreference: $user.genderPreference,
            agePreferenceFrom: $user.agePreferenceFrom,
            agePreferenceTo: $user.agePreferenceTo,
            alcoholPreference: $user.alcoholPreference
        })
        CREATE (g: Group)
        SET u.id = apoc.create.uuid()
        SET g.id = apoc.create.uuid()
        MERGE(u)-[:OWNER]->(g)
        RETURN u
    """
    )

    login(email: String!, password: String!): LoginPayload

    deleteAccount: Message
    @cypher(
        statement: """
            MATCH (a:Account {id: $meId})
            MATCH (a)-[relations]-(any)
            DELETE relations, a
            RETURN {status: 'OK', message: ${deleteAccountSuccess}}
        """
    )
`;
