import { gql } from "apollo-server";

export const ME = gql`
    query {
        me {
            id
            email
            name
            description
            age
            gender
            favoriteAlcoholName
            favoriteAlcoholType
            genderPreference
            alcoholPreference
            agePreferenceFrom
            agePreferenceTo
            friends {
                id
            }
            groups {
                id
            }
            groupInvitations {
                id
            }
        }
    }
`;