import { Driver, Session } from "neo4j-driver";

/*
  `createIndexes` creates indexes for both types: `Account` and `Group`.
  It is supposed to magically ensure that neo4j database is launched correctly every time.
  I have not idea why it is like that but I have seen it somewhere so I decided to keep it that way.
*/
export const createIndexes = async (driver: Driver): Promise<void> => {
  const initCypher: string = `
    CALL apoc.schema.assert(
      {}, {Account: ["id"], Group: ["id"]}
    )
  `;

  const session: Session = driver.session();
  try {
    await session.run(initCypher);
  } catch (error) {
    console.error("Database initialization failed to complete\n", error.message);
  } finally {
    await session.close();
  }
};

export const initializeDatabase = async (driver: Driver): Promise<void> => {
  await createIndexes(driver);
};
