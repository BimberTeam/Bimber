export const GroupQueries = `
    group(id: ID!): Group
    @cypher(
        statement: """
        MATCH(group: Group { id: $id })
        RETURN group
        """
    )

    groupInfo(id: ID!): GroupInfoPayload

    listFriendsWithoutGroupMembership(id: ID!): [User]
    @cypher(
        statement: """
        MATCH (me: Account{id: $meId})
        MATCH (group: Group{id: $id})
        MATCH (a: Account)-[:FRIENDS]->(me)
        WHERE NOT EXISTS ( (a)-[:PENDING]-(group) ) AND NOT EXISTS ( (a)-[:BELONGS_TO]-(group) ) AND NOT EXISTS ( (a)-[:GROUP_INVITATION]-(group) )
        RETURN a
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
            CALL{
                MATCH (a)-[b:BELONGS_TO]->(g)
                RETURN count(b) as group_count
            }
            RETURN {
                name: a.name,
                email: a.email,
                age: a.age,
                favoriteAlcoholName: a.favoriteAlcoholName,
                favoriteAlcoholType: a.favoriteAlcoholType,
                description: a.description,
                gender: a.gender,
                genderPreference: a.genderPreference,
                alcoholPreference: a.alcoholPreference,
                agePreference: a.agePreference,
                votesAgainst: votes_against,
                votesInFavour: votes_in_favour,
                groupCount: group_count
            }
        """
    )
`;
