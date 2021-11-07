import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Authenticate User Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "silasstofel@gmail.com",
    password: "123456",
  };

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await connection.query("DELETE FROM users");
    // Create user
    await request(app).post("/api/v1/users").send(payloadCreateUser);
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to authenticate a user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send(payloadCreateUser);
    expect(response.status).toBe(200);
  });

  it("Should not be able to authenticate with invalid user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "invalido@gmail.com",
      password: "password",
    });
    const { message } = response.body;
    expect(response.status).toBe(401);
    expect(message).toBe("Incorrect email or password");
  });

  it("Should not be able to authenticate with invalid password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: payloadCreateUser.email,
      password: "password",
    });
    const { message } = response.body;
    expect(response.status).toBe(401);
    expect(message).toBe("Incorrect email or password");
  });
});
