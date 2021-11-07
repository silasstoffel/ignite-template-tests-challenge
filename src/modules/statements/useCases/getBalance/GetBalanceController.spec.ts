import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Show User Profile Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "get-balance-controller@gmail.com",
    password: "123456",
  };
  let token = "";

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await connection.query("DELETE FROM users");
    await connection.query("DELETE FROM statements");

    // Create user
    await request(app).post("/api/v1/users").send(payloadCreateUser);

    // Auth
    const response = await request(app)
      .post("/api/v1/sessions")
      .send(payloadCreateUser);

    token = response.body.token;
    const {user} = response.body;

    await connection.query(`
    INSERT INTO statements
      (id, user_id, description, amount, "type", created_at, updated_at)
    VALUES (
        'c511af7d-70af-4db1-9ec8-c9078f9a281b',
        '${user.id}',
        '',
        100,
        'deposit',
        now(),
        now()
        );
    `);

    await connection.query(`
    INSERT INTO statements
      (id, user_id, description, amount, "type", created_at, updated_at)
    VALUES (
        'c511af7d-70af-4db1-9ec8-c9078f9a281c',
        '${user.id}',
        '',
        10,
        'withdraw',
        now(),
        now()
        );
    `);

  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to load statement", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statement');
    expect(response.body.statement.length).toBe(2);
    expect(response.body).toHaveProperty('balance', 90);
  });

  it("Should not be able to load statement with invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer TokenInvalid`,
      });
    expect(response.status).toBe(401);
  });

});
