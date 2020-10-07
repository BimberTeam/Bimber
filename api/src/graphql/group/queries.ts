export const GroupQueries = `
    group(id: Int!): Group  @cypher(
        statement: """
        MATCH(group: Group { id: $id })
        RETURN group
        """
    )

    groupList: [Group]
    @cypher(
        statement: """
            MATCH (a:Account {id: $meId})
            MATCH (a)-[:BELONGS_TO]->(g:Group)
            RETURN g
        """
    )
`;
