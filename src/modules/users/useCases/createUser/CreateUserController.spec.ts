import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Create User Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "create-user-controller1@hotmail.com",
    password: "123456",
  };

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await connection.query("DELETE FROM users");
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send(payloadCreateUser);
    expect(response.status).toBe(201);
  });
});
