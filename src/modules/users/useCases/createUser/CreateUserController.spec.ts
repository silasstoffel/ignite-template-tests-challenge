import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Create User Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "silasstofel@gmail.com",
    password: "123456",
  };

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    connection.query("DELETE FROM users");
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send(payloadCreateUser);
    expect(response.status).toBe(201);
  });

  it("Should be not able to create if user already exists", async () => {
    payloadCreateUser.email = 'silasstofel@hotmail.com';
    await request(app).post("/api/v1/users").send(payloadCreateUser);
    const response = await request(app).post("/api/v1/users").send(payloadCreateUser);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});
