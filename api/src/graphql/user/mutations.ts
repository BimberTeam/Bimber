const registerSuccessful = "'Rejestracja powiodła się!'";

// accept friend request messages
const friendAdded = "'Zaakceptowano zaproszenie do znajomych!'";
const friendAlreadyExists = "'Jesteście już znajomymi!'";
const friendMissingRequest = "'Nie dostałeś takiego zaproszenia!'";
const friendDeleted = "'Usunięto znajomego!'";

const friendRequestSent = "'Wysłano zaproszenie do znajomych!'";
const friendRequestDenied = "'Odrzucono prośbę o dołączenie do znajomych!'";

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
                WHEN true THEN {status: 'OK', message: ${friendAdded}}
                ELSE {status: 'ERROR', message: ${friendAlreadyExists}}
                END
            ) AS res
            REMOVE a.is_exist
            RETURN res
            \\",
            \\"
            RETURN {status: 'ERROR', message: ${friendMissingRequest}} AS res
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
        RETURN {status: 'OK', message: ${friendDeleted}}
    """
    )

    sendFriendRequest(friendId: ID!): Message
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $friendId })
        CALL apoc.do.case([
            EXISTS((a)-[:FRIENDS]->(b))=true OR EXISTS((b)-[:FRIENDS]->(a))=true,
                \\"RETURN {status: 'ERROR', message: ${friendAlreadyExists}} AS result\\",
            EXISTS((b)-[:REQUESTED_FRIENDS]->(a))=true,
                \\" WITH $a AS a, $b AS b
                OPTIONAL MATCH(a)-[fa:REQUESTED_FRIENDS]->(b)
                OPTIONAL MATCH(b)-[fb:REQUESTED_FRIENDS]->(a)
                DELETE fa, fb
                MERGE(a)-[:FRIENDS]->(b)
                MERGE(b)-[:FRIENDS]->(a)
                RETURN {status: 'OK', message: ${friendAdded}} AS result \\",
            EXISTS((b)-[:REQUESTED_FRIENDS]->(a))=false,
                \\"  WITH $a AS a, $b AS b
                MERGE(a)-[:REQUESTED_FRIENDS]->(b)
                ON CREATE SET a.is_exist = true
                ON MATCH SET a.is_exist = false
                WITH a, (
                    CASE a.is_exist
                    WHEN true THEN {status: 'OK', message: ${friendRequestSent}}
                    ELSE {status: 'ERROR', message: ${friendAlreadyExists}}
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
        RETURN {status: 'OK', message: ${friendRequestDenied}}
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

    me: Account
    @cypher(
    statement: """
        MATCH (a:Account {id: $meId})
        RETURN a
    """
    )
`;