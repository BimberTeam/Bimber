export const GroupQueries = `
    group(id: ID!): Group
    @cypher(
        statement: """
        MATCH(group: Group { id: $id })
        RETURN group
        """
    )

    groupInfo(id: ID!): GroupInfoPayload

    groupMembersWithoutFriendship(groupId: ID!): [User]
    @cypher(
        statement: """
        MATCH(group: Group {id: $groupId})
        MATCH(me: Account {id: $meId})
        MATCH (group)<-[:BELONGS_TO]-(a:Account)
        WHERE NOT EXISTS( (me)<-[:FRIENDS]-(a:Account) ) AND NOT EXISTS( (me)<-[:REQUESTED_FRIENDS]-(a:Account) ) AND NOT a in [me]
        RETURN a
        """
    )

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

    groupCandidatesResult(input: GroupCandidatesResult): [GroupCandidatesPayload]

    groupCandidates(input: GroupCandidatesInput): [User]
    @cypher(
        statement: """
            MATCH (a: Account)-[:PENDING]->(g:Group{id: $input.groupId})
            WHERE NOT( (g)-[:VOTE_AGAINST{id: $meId}]->(a) ) AND NOT( (g)-[:VOTE_IN_FAVOUR{id: $meId}]->(a) )
            RETURN a
        """
    )
`;
