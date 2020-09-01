export const getValueFromSessionResult = (sessionResult, key) => {
    return sessionResult.records[0].get(key);
};
