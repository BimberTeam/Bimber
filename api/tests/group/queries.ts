import { DocumentNode } from 'graphql';
import { gql } from 'apollo-server';

export const SUGGEST_GROUPS: DocumentNode =  gql`
    query(
        $limit: Int!,
        $range: Int!
    ) {
        suggestGroups(input: {
            limit: $limit,
            range: $range
        })
        {
            id
            members{
                id
                name
                email
                age
                latestLocation{
                    latitude
                    longitude
                }
            }
            averageAge
            averageLocation{
                latitude
                longitude
            }
        }
    }
`;
