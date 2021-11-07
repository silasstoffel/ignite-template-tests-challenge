import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Show User Profile Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "user-create-statement@gmail.com",
    password: "123456",
  };
  let token = "";
  let userId = "";

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await connection.query(`DELETE FROM statements WHERE statements.user_id IN(SELECT id FROM users WHERE email = '${payloadCreateUser.email}')`);
    await connection.query(`DELETE FROM users WHERE email = '${payloadCreateUser.email}'`);
    // Create user
    await request(app).post("/api/v1/users").send(payloadCreateUser);

    // Auth
    const response = await request(app)
      .post("/api/v1/sessions")
      .send(payloadCreateUser);

    token = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await connection.close();
  });

  it("Should be able to create a deposit statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 24.99,
        description: 'anything'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id', userId);
    expect(response.body).toHaveProperty('type', 'deposit');
    expect(response.body).toHaveProperty('amount', 24.99);
  });

  it("Should be able to create a withdraw statement", async () => {
    // deposit
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.00,
        description: 'anything'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    //withdraw
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: 'anything'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id', userId);
    expect(response.body).toHaveProperty('type', 'withdraw');
    expect(response.body).toHaveProperty('amount', 10.00);
  });

  it("Should be able to create a withdraw or deposit statement with invalid user", async () => {
    //withdraw
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: 'anything'
      })
      .set({
        Authorization: `Bearer c511af7d-70af-4db1-9ec8-c9078f9a281b`,
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'JWT invalid token!');
  });

  it("Should not be able to create withdraw statement if amount more than balance", async () => {
    await connection.query(`DELETE FROM statements WHERE statements.user_id IN(SELECT id FROM users WHERE email = '${payloadCreateUser.email}')`);
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: 'anything'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Insufficient funds');
  });

});
