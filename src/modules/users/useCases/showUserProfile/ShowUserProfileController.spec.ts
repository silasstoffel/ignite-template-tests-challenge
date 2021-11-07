import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Show User Profile Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "show-user-profile@gmail.com",
    password: "123456",
  };
  let token = "";

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await connection.query(`DELETE FROM users WHERE email = '${payloadCreateUser.email}'`);
    // Create user
    await request(app).post("/api/v1/users").send(payloadCreateUser);

    // Auth
    const response = await request(app)
      .post("/api/v1/sessions")
      .send(payloadCreateUser);

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.query(`DELETE FROM users WHERE email = '${payloadCreateUser.email}'`);
    await connection.close();
  });

  it("Should be able to load user", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .send(payloadCreateUser)
      .set({
        Authorization: `Bearer ${token}`
      });
    expect(response.status).toBe(200);
  });

});
