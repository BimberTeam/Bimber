export const GroupQueries = `
    getInfoAboutGroup(id: Int!): Group  @cypher(
        statement: """
        MATCH(group: Group { id: $id })
        RETURN group
        """
    )
`;
