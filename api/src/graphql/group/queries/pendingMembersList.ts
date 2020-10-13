import { isAuthorized } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

const groupDoesNotExist = "'Podana grupa nie istnieje !'";
const userDoesNotBelongsToGroup = "'Nie należysz do podanej grupy !'";

export default async (obj, params, ctx, resolveInfo) => {

    const session: Session = ctx.driver.session();
    isAuthorized(ctx);

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.groupId}"})
        RETURN g as result
        `,
    );

    if(doesGroupExist.records.length === 0) {
        throw new ApolloError(groupDoesNotExist, "400", [groupDoesNotExist]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account{id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(userDoesNotBelongsToGroup, "400", [userDoesNotBelongsToGroup]);
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};