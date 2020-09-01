export const UserQueries = `
    getInfoAboutUser(id: Int): limitedInfoAboutUser
    @cypher(
        statement: """
        MATCH(user: User { id: $id })
        RETURN {
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            age: user.age,
            favoriteDrinkName: user.favoriteDrinkName,
            favoriteDrinkCategory: user.favoriteDrinkCategory,
            description: user.description,
            gender: user.gender,
            genderPreference: user.genderPreference,
            drinkPreference: user.drinkPreference,
            agePreference: user.agePreference
        }
        """
    )
`;
