import { modes, app } from "../server";
import * as supertest from "supertest";
import { Server } from "http";
import { getConnection, getMongoRepository } from "typeorm";
import Developer from "../models/developers";
const developers = require("./developers.json");

let testApp: Server;

const sampleData = [
  {
    name: "Frederick",
    language: "C++",
    experienceLevel: 5,
    animal: "ut"
  },
  { name: "Judy", language: "Dart", experienceLevel: 3, animal: "aut" },
  {
    name: "Herman",
    language: "Kotlin",
    experienceLevel: 9,
    animal: "ut"
  },
  {
    name: "Aurelia",
    language: "Java",
    experienceLevel: 7,
    animal: "ullam"
  },
  {
    name: "Whitney",
    language: "Kotlin",
    experienceLevel: 9,
    animal: "magni"
  }
];

describe("Migration Tests", () => {
  //ARRANGE
  beforeEach(async () => {
    testApp = await app(4001, modes.test);
  });

  afterEach(async () => {
    const connection = getConnection("test");
    if (connection.isConnected) await connection.close();
    await testApp.close();
  });

  it("pushes the payload into the db", async () => {
    //ACT
    const resp = await supertest(testApp)
      .post("/migrate")
      .send(sampleData);

    //ASSERT
    expect(resp.body).toHaveLength(5);
    expect(resp.body[0].name).toBe("Frederick");
  });

  it("migrates data from the payload", async () => {
    await supertest(testApp)
      .post("/migrate")
      .send(sampleData);
    const repository = getMongoRepository(Developer, "test");
    const fromDB = await repository.find({});
    expect(fromDB[0].updatedAt).toBeTruthy();
  });

  it("migrates the data in chunks", async () => {
    const slicedDevs = developers.slice(0, 200);
    //act
    await supertest(testApp)
      .post("/migrate")
      .send(slicedDevs);

    //assert
    const repository = getMongoRepository(Developer, "test");
    const first100 = await repository.find({ take: 100 });
    expect(first100[0].migratedAt).toBe(first100[88].migratedAt);

    const next100 = await repository.find({ take: 100, skip: 100 });
    expect(next100[34].migratedAt).toBe(next100[91].migratedAt);
  }, 100000);
});
