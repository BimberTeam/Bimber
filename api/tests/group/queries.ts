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
