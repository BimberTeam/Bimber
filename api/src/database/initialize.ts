import { Driver, Session } from "neo4j-driver";

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


/*
  `createIndexes` creates indexes for both types: `Account` and `Group`.
  It is supposed to magically ensure that neo4j database is launched correctly every time.
  I have not idea why it is like that but I have seen it somewhere so I decided to keep it that way.
*/
export const createIndexes = async (driver: Driver, {retries: retires = 5, timeout: timeout = 5000}): Promise<void> => {
  const initCypher: string = `
    CALL apoc.schema.assert(
      {}, {Account: ["id"], Group: ["id"]}
    )
  `;

  for (let i = 0; i < retires; i++) {
    const session: Session = driver.session();

    let success = false;
    try {
      await session.run(initCypher);
      success = true;
    } catch (error) {
      console.error("Database initialization failed to complete\n", error.message);
    } finally {
      await session.close();
      if (success) {
        console.log("Initialized database");
        return;
      } else {
        // sleep before next retry
        await sleep(timeout);
      }
    }
  }
  return;
};

export const initializeDatabase = async (driver: Driver, args: {retries: number, timeout: number}): Promise<void> => {
  await createIndexes(driver, args);
};
