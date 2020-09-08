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
`;
