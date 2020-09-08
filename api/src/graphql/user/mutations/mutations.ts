export const AccountMutations = `
    acceptFriendRequest(friendId: Int!): String
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
                WHEN true THEN 'Friend added successfully!'
                ELSE 'This relation already exist!'
                END
            ) AS res
            REMOVE a.is_exist
            RETURN res
            \\",
            \\"
            RETURN 'You cannot add this user to friends !' AS res
            \\",
            {a:a, b:b, fa:fa, fb:fb}
        ) YIELD value
        RETURN value.res
    """
    )

    removeFriend(friendId: Int!): String
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $friendId })
        OPTIONAL MATCH (a)-[fa:FRIENDS]->(b)
        OPTIONAL MATCH (b)-[fb:FRIENDS]->(a)
        DELETE fa, fb
        RETURN 'Friend deleted'
    """
    )

    sendFriendRequest(friendId: Int!): String
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $friendId })
        CALL apoc.do.case([
            EXISTS((a)-[:FRIENDS]->(b))=true OR EXISTS((b)-[:FRIENDS]->(a))=true,
                \\"RETURN 'You are already friend with this user!' AS result\\",
            EXISTS((b)-[:REQUESTED_FRIENDS]->(a))=true,
                \\" WITH $a AS a, $b AS b
                OPTIONAL MATCH(a)-[fa:REQUESTED_FRIENDS]->(b)
                OPTIONAL MATCH(b)-[fb:REQUESTED_FRIENDS]->(a)
                DELETE fa, fb
                MERGE(a)-[:FRIENDS]->(b)
                MERGE(b)-[:FRIENDS]->(a)
                RETURN 'Added friend' AS result \\",
            EXISTS((b)-[:REQUESTED_FRIENDS]->(a))=false,
                \\"  WITH $a AS a, $b AS b
                MERGE(a)-[:REQUESTED_FRIENDS]->(b)
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

    denyFriendRequest(userId: Int!): String
    @cypher(
    statement: """
        MATCH(a: Account { id: $meId })
        MATCH(b: Account { id: $userId })
        MATCH (a)-[f:REQUESTED_FRIENDS]->(b)
        DELETE f
        RETURN 'Invitation rejected'
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

    register(user: RegisterAccountInput): String
    @cypher(
    statement: """
        CREATE (u:Account {
            name: $user.name,
            email: $user.email,
            password: $user.password,
            imageUrl: $user.imageUrl,
            age: $user.age,
            latestLocation: $user.latestLocation,
            favoriteAlcoholName: $user.favoriteAlcoholName,
            favoriteAlcoholType: $user.favoriteAlcoholType,
            description: $user.description,
            gender: $user.gender,
            genderPreference: $user.genderPreference,
            agePreference: $user.agePreference,
            alcoholPreference: $user.alcoholPreference
        })
        CREATE (g: Group)
        SET u.id = id(u)
        SET g.id = id(g)
        MERGE(u)-[:OWNER]->(g)
        RETURN 'Registration Complete!'
    """
    )

    login(email: String!, password: String!): String

    me: Account
    @cypher(
    statement: """
        MATCH (a:Account {id: $meId})
        RETURN a
    """
    )
`;
