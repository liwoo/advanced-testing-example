import * as express from "express";
import * as bodyParser from "body-parser";
import "reflect-metadata";
import { createConnection, getMongoRepository } from "typeorm";
import Developer from "./models/developers";
import { chunk } from "lodash";

const fakeApi = {
  post: (data: any[]) =>
    new Promise(res => {
      setTimeout(() => {
        res(`Successfully Migrated ${data.length} elements`);
      }, 500);
    })
};

export enum modes {
  production,
  development,
  test,
  staging
}

//Test DB should be on local Server
export const app = async (port: number, mode: modes) => {
  const app = express();
  const dbMode = mode === modes.test ? "test" : "development";

  try {
    await createConnection(dbMode);
    console.log("🚀 Connection Made");
  } catch (error) {
    console.error(error);
  }

  app.use(bodyParser.json({ limit: "100mb" }));

  app.get("/", (req: express.Request, res: express.Response) => {
    return res.send("Hello World");
  });

  app.post("/migrate", async (req: express.Request, res: express.Response) => {
    try {
      //Delete from Database
      const repository = getMongoRepository(Developer, dbMode);
      await repository.deleteMany({});

      //Write to DB Operations
      const developers: Developer[] = await repository.save(req.body);
      const bodyChunks = chunk(developers, 100);

      //Migrate Operation
      for (const bodyChunk of bodyChunks) {
        const apiResp = await fakeApi.post(bodyChunk);
        const searchIDs = bodyChunk.map(bc => bc._id);
        // const devsfromDB = await Developer.findByIds(searchIDs);
        if (apiResp) {
          await repository.updateMany(
            { _id: { $in: searchIDs } },
            { $set: { migratedAt: Date.now().toString() } }
          );
        }
      }

      return res.json(developers);
    } catch (error) {
      console.log(error);
      return res.send("Something Went Wrong. Check your Payload Structure...");
    }
  });

  return await app.listen(port, () =>
    console.log(`🎉 listening to port ${port}`)
  );
};
