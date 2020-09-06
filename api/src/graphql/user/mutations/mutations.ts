export const UserMutations = `
    friendRequest(friendId: Int!): String
    @cypher(
    statement: """
        MATCH(a: User { id: $meId })
        MATCH(b: User { id: $friendId })
        OPTIONAL MATCH(a)-[fa:REQUESTED_FRIENDS]->(b)
        OPTIONAL MATCH(b)-[fb:REQUESTED_FRIENDS]->(a)
        DELETE fa, fb
        MERGE(a)-[:FRIENDS]->(b)
        MERGE(b)-[:FRIENDS]->(a)
        ON CREATE SET a.is_exist = true
        ON MATCH SET a.is_exist = false
        WITH a, (
            CASE a.is_exist
            WHEN true THEN 'Ok'
            ELSE 'This relation already exist'
            END
        ) AS result
        REMOVE a.is_exist
        RETURN result
    """
    )

    removeFriend(friendId: Int!): String
    @cypher(
    statement: """
        MATCH(a: User { id: $meId })
        MATCH(b: User { id: $friendId })
        OPTIONAL MATCH (a)-[fa:FRIENDS]->(b)
        OPTIONAL MATCH (b)-[fb:FRIENDS]->(a)
        DELETE fa, fb
        RETURN 'Friend deleted'
    """
    )

    sendFriendRequest(userInvitedID: Int!): String
    @cypher(
    statement: """
        MATCH(a: User { id: $meId })
        MATCH(b: User { id: $userInvitedID })
        CALL apoc.do.case([
            EXISTS((a)-[:FRIENDS]->(b))=true OR EXISTS((b)-[:FRIENDS]->(a))=true,
                \\"RETURN 'This users are already friends' AS result\\",
            EXISTS((a)-[:REQUESTED_FRIENDS]->(b))=true,
                \\" WITH $a AS a, $b AS b
                OPTIONAL MATCH(a)-[fa:REQUESTED_FRIENDS]->(b)
                OPTIONAL MATCH(b)-[fb:REQUESTED_FRIENDS]->(a)
                DELETE fa, fb
                MERGE(a)-[:FRIENDS]->(b)
                MERGE(b)-[:FRIENDS]->(a)
                RETURN 'Added friend' AS result \\",
            EXISTS((a)-[:REQUESTED_FRIENDS]->(b))=false,
                \\"  WITH $a AS a, $b AS b
                MERGE(b)-[:REQUESTED_FRIENDS]->(a)
                ON CREATE SET a.is_exist = true
                ON MATCH SET a.is_exist = false
                WITH a, (
                    CASE a.is_exist
                    WHEN true THEN 'Ok'
                    ELSE 'This relation already exist'
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

    cancelFriendRequest(userId: Int!): String
    @cypher(
    statement: """
        MATCH(a: User { id: $meId })
        MATCH(b: User { id: $userId })
        MATCH (a)-[f:REQUESTED_FRIENDS]->(b)
        DELETE f
        RETURN 'Invitation rejected'
    """
    )

    register(userInput: RegisterUserInput): String
    @cypher(
    statement: """
        CREATE (u:User {
            name: $userInput.name,
            email: $userInput.email,
            password: $userInput.password,
            imageUrl: $userInput.imageUrl,
            age: $userInput.age,
            latestLocation: $userInput.latestLocation,
            favoriteAlcoholName: $userInput.favoriteAlcoholName,
            favoriteAlcoholType: $userInput.favoriteAlcoholType,
            description: $userInput.description,
            gender: $userInput.gender,
            genderPreference: $userInput.genderPreference,
            agePreference: $userInput.agePreference
        })
        CREATE (g: Group)
        SET u.id = id(u)
        SET g.id = id(g)
        MERGE(u)-[:OWNER]->(g)
        RETURN 'Registration Complete!'
    """
    )

    login(email: String!, password: String!): String

    me: User
    @cypher(
    statement: """
        MATCH (u:User {email: $email})
        RETURN u
    """
    )
`;
