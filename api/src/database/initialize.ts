export const initializeDatabase = (driver: any) => {
    const initCypher = `CALL apoc.schema.assert(
        {}, {User: ["userId"], Business: ["businessId"], Review: ["reviewId"], Category: ["name"]}
        )`;
    const executeQuery = (driver: { session: () => any; }) => {
      const session = driver.session();
      return session
        .writeTransaction((tx) => tx.run(initCypher))
        .then()
        .finally(() => session.close());
    };

    executeQuery(driver).catch((error) => {
      console.error("Database initialization failed to complete\n", error.message);
    });
};
