export const AccountQueries = `
    user(id: Int): User
    @cypher(
        statement: """
        MATCH(account: Account { id: $id })
        RETURN {
            name: account.name,
            email: account.email,
            imageUrl: account.imageUrl,
            age: account.age,
            favoriteAlcoholName: account.favoriteAlcoholName,
            favoriteAlcoholType: account.favoriteAlcoholType,
            description: account.description,
            gender: account.gender,
            genderPreference: account.genderPreference,
            alcoholPreference: account.alcoholPreference,
            agePreference: account.agePreference
        }
        """
    )

    friendsList: [User]
    @cypher(
        statement: """
            MATCH (a:Account {id: $meId})
            MATCH (a)<-[:FRIENDS]-(friends:Account)
            RETURN friends
        """
    )

    requestedFriendsList: [User]
    @cypher(
        statement: """
            MATCH (a:Account {id: $meId})
            MATCH (a)<-[:REQUESTED_FRIENDS]-(friends:Account)
            RETURN friends
        """
    )

    requestedGroupList: [Group]
    @cypher(
        statement: """
            MATCH (a:Account {id: $meId})
            MATCH (a)-[:REQUESTED]->(groups:Group)
            RETURN groups
        """
    )
`;
