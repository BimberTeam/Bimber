export const AccountQueries = `
    me: Account
    @cypher(
    statement: """
        MATCH (a:Account {id: $meId})
        RETURN a
    """
    )

    accountExists(email: String!): Boolean
    @cypher(
    statement: """
    MATCH(account: Account{email: $email})
    return count(account)=1 as result
    """
    )

    user(id: ID!): User
    @cypher(
        statement: """
        MATCH(account: Account { id: $id })
        RETURN account
        """
    )
`;
