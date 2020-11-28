import { DocumentNode } from 'graphql';
import { gql } from 'apollo-server';

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

export const SWIPE_TO_LIKE: DocumentNode = gql`
    mutation ($groupId: ID!){
        swipeToLike(input: {
            groupId: $groupId
        }) {
            message
            status
        }
    }
`;

export const SWIPE_TO_DISLIKE: DocumentNode = gql`
    mutation ($groupId: ID!){
        swipeToDislike(input: {
            groupId: $groupId
        }) {
            message
            status
        }
    }
`;