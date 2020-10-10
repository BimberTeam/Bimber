export const getValueFromSessionResult = (sessionResult, key: string) => {
    return sessionResult.records[0].get(key);
};
