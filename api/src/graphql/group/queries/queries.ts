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

    pendingMembersList(groupId: Int): [PendingMemberListPayload]
    @cypher(
        statement: """
            MATCH (a: Account)-[:PENDING]->(g:Group{id: $groupId})
            WHERE NOT( (g)-[:VOTE_AGAINST{id: $meId}]->(a) ) AND NOT( (g)-[:VOTE_FAVOUR{id: $meId}]->(a) )
            CALL{
                MATCH (a)-[vf:VOTE_FAVOUR]->(g)
                RETURN count(vf) as vote_favour
            }
            CALL{
                MATCH (a)-[va:VOTE_AGAINST]->(g)
                RETURN count(va) as vote_against
            }
            RETURN {
                name = a.name
            }
        """
    )
`;
