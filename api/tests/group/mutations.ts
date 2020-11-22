import { DocumentNode } from 'graphql';
import { gql } from 'apollo-server';

export const SUGGEST_GROUP: DocumentNode =  gql`
    mutation(
        $limit: Int!,
        $range: Int!
    ) {
        suggestGroups(input: {
            limit: $limit,
            range: $range
        })
    }
`;

export const CREATE_GROUP: DocumentNode = gql`
    mutation ($usersId: [ID!]!){
        createGroup(input: {
            usersId: $usersId
        }) {
            message
            status
        }
    }
`;

export const ACCEPT_GROUP_INVITATION: DocumentNode = gql`
    mutation ($input: AcceptGroupInvitationInput!){
        acceptGroupInvitation(input: $input) {
            message
            status
        }
    }
`;

export const REJECT_GROUP_INVITATION: DocumentNode = gql`
    mutation ($input: RejectGroupInvitationInput!){
        rejectGroupInvitation(input: $input) {
            message
            status
        }
    }
`;