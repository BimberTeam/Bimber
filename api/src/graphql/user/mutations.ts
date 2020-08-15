export const UserMutations = `
    addFriend(from: Int!, to: Int!): String
    @cypher(
        statement: """
        MATCH(a: User { id: $from })
        MATCH(b: User { id: $to })
        MERGE(a)-[:FRIENDS]->(b)
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

    deleteFriend(from: Int!, to: Int!): String
    @cypher(
        statement: """
        MATCH(a: User { id: $from })
        MATCH(b: User { id: $to })
        MATCH (a)-[:FRIENDS]->(b)
        MERGE(a)-[:FRIENDS]->(b)
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

    register(userInput: registerUserInput): String
    @cypher(
    statement: """
        CREATE (u:User {
            name: $userInput.name,
            email: $userInput.email,
            password: $userInput.password,
            imageUrl: $userInput.imageUrl,
            age: $userInput.age,
            location: $userInput.location,
            favoriteDrinkName: $userInput.favoriteDrinkName,
            favoriteDrinkCategory: $userInput.favoriteDrinkCategory,
            description: $userInput.description,
            gender: $userInput.gender,
            genderPreference: $userInput.genderPreference,
            agePreference: $userInput.agePreference
        })
        SET u.id = id(u)
        RETURN 'Registration Complete!'
    """
    )

    login(email: String!, password: String!): String

`;

export const UserInputs = `

    enum drinkCategory {
        Vodka
        Beer
        Wine
    }

    input registerUserInput {
        name: String!
        email: String!
        password: String!
        imageUrl: String
        age: Int!
        location: Point
        favoriteDrinkName: String!
        favoriteDrinkCategory: drinkCategory!
        description: String!
        gender: Gender!
        genderPreference: Gender!
        drinkPreference: drinkCategory!
        agePreference: Int!
    }
`;
