export const UserQueries = `
    user(id: Int): publicUser
    @cypher(
        statement: """
        MATCH(user: User { id: $id })
        RETURN {
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            age: user.age,
            favoriteAlcoholName: user.favoriteAlcoholName,
            favoriteAlcoholType: user.favoriteAlcoholType,
            description: user.description,
            gender: user.gender,
            genderPreference: user.genderPreference,
            alcoholPreference: user.alcoholPreference,
            agePreference: user.agePreference
        }
        """
    )
`;
