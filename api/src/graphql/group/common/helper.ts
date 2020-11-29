import { Point } from "neo4j-driver";

interface Coords{
    latitude: number
    longitude: number
}

export const mapPointToLocation = (point: Point): Coords  => {
    return {
        "latitude": point && point['y'] || null,
        "longitude": point && point['x'] || null,
    };
}

export const mapLocationAndGetProperties = (list: any): any =>  {
    return list.map(
        element => {
            element["properties"]['latestLocation'] = mapPointToLocation(element["properties"]['latestLocation']);
            element["properties"]['age'] = element["properties"]['age'].low;
            return element["properties"];
        });
};