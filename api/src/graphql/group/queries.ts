export const GroupQueries = `
    group(id: ID!): Group  @cypher(
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

    pendingMembersList(input: PendingMembersListInput): [PendingMemberListPayload]
    @cypher(
        statement: """
            MATCH (a: Account)-[:PENDING]->(g:Group{id: $input.groupId})
            WHERE NOT( (g)-[:VOTE_AGAINST{id: $meId}]->(a) ) AND NOT( (g)-[:VOTE_IN_FAVOUR{id: $meId}]->(a) )
            CALL{
                MATCH (a)-[vf:VOTE_IN_FAVOUR]->(g)
                RETURN count(vf) as votes_in_favour
            }
            CALL{
                MATCH (a)-[va:VOTE_AGAINST]->(g)
                RETURN count(va) as votes_against
            }
            RETURN {
                name: a.name,
                email: a.email,
                imageUrl: a.imageUrl,
                age: a.age,
                favoriteAlcoholName: a.favoriteAlcoholName,
                favoriteAlcoholType: a.favoriteAlcoholType,
                description: a.description,
                gender: a.gender,
                genderPreference: a.genderPreference,
                alcoholPreference: a.alcoholPreference,
                agePreference: a.agePreference,
                votesAgainst: votes_against,
                votesInFavour: votes_in_favour
            }
        """
    )
`;
