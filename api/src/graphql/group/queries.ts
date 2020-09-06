export const GroupQueries = `
    group(id: Int!): Group  @cypher(
        statement: """
        MATCH(group: Group { id: $id })
        RETURN group
        """
    )
`;
