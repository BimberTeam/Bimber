import { Driver, Session } from "neo4j-driver";

/*
  The createIndexes function is responsible for create indexes
  for table User and Group, and ensure that neo4j database was launched correctly
*/
export const createIndexes = async (driver: Driver): Promise<void> => {
  const initCypher: string = `
    CALL apoc.schema.assert(
      {}, {User: ["id"], Group: ["id"]}
    )
  `;

  const session: Session = driver.session();
  try {
    await session.run(initCypher);
    await session.close();
  } catch (error) {
    console.error("Database initialization failed to complete\n", error.message);
  }
};

export const initializeDatabase = async (driver: Driver): Promise<void> => {
  await createIndexes(driver);
};
