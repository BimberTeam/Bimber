import { DocumentNode } from 'graphql';
import { gql } from "apollo-server";

export const REGISTER: DocumentNode = gql`
    mutation(
        $name: String!,
        $email: String!,
        $password: String!,
        $age: Int!,
        $favoriteAlcoholName: String!,
        $favoriteAlcoholType: AlcoholType!,
        $description: String!,
        $gender: Gender!,
        $genderPreference: Gender,
        $alcoholPreference: AlcoholType!,
        $agePreferenceFrom: Int!,
        $agePreferenceTo: Int!
    ) {
        register(input: {
            name: $name,
            email: $email,
            password: $password,
            age: $age,
            favoriteAlcoholName: $favoriteAlcoholName,
            favoriteAlcoholType: $favoriteAlcoholType,
            description: $description,
            gender: $gender,
            genderPreference: $genderPreference,
            alcoholPreference: $alcoholPreference,
            agePreferenceFrom: $agePreferenceFrom,
            agePreferenceTo: $agePreferenceTo
        }) {
            id
            name
            email
            password
            age
            favoriteAlcoholName
            favoriteAlcoholType
            description
            gender
            genderPreference
            alcoholPreference
            agePreferenceFrom
            agePreferenceTo
        }
    }
`;

export const LOGIN: DocumentNode = gql`
    mutation($email: String!, $password: String!) {
        login(input: {
            email: $email,
            password: $password
        }) {
            token
        }
    }
`;

export const ADD_FRIEND: DocumentNode = gql`
    mutation($input: FriendInput!){
        sendFriendRequest(input: $input) {
            message
            status
        }
    }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
    mutation ($input: FriendInput!){
        acceptFriendRequest(input: $input) {
            message
            status
        }
    }
`;

export const DENY_FRIEND_REQUEST: DocumentNode = gql`
    mutation ($input: FriendInput!){
        denyFriendRequest(input: $input) {
            message
            status
        }
    }
`;

export const REMOVE_FRIEND: DocumentNode = gql`
    mutation ($input: FriendInput!){
        removeFriend(input: $input) {
            message
            status
        }
    }
`;

export const UPDATE_LOCATION: DocumentNode = gql`
    mutation ($latitude: Float, $longitude: Float) {
        updateLocation(input: {latitude: $latitude, longitude: $longitude}) {
            message
            status
        }
    }
`;