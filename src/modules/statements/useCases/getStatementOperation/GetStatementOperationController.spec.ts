import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

describe("Get Statement Operation Controller", () => {
  let connection: Connection;
  let payloadCreateUser = {
    name: "Silas Stoffel",
    email: "get-statement-operation-controller@gmail.com",
    password: "123456",
  };

  let token = "";
  let userId = "";

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await connection.query(
      `DELETE FROM statements WHERE statements.user_id IN(SELECT id FROM users WHERE email = '${payloadCreateUser.email}')`
    );
    await connection.query(
      `DELETE FROM users WHERE email = '${payloadCreateUser.email}'`
    );
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
    await connection.query(
      `DELETE FROM statements WHERE statements.user_id IN(SELECT id FROM users WHERE email = '${payloadCreateUser.email}')`
    );
    await connection.query(
      `DELETE FROM users WHERE email = '${payloadCreateUser.email}'`
    );
    await connection.close();
  });

  it("Should be able to load a deposit statement", async () => {
    let response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.00,
        description: "anything",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = response.body;

    response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', id);
    expect(response.body).toHaveProperty('user_id', userId);
    expect(response.body).toHaveProperty('amount', "100.00");
    expect(response.body).toHaveProperty('type', 'deposit');
  });

  it("Should be able to load a deposit statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 95.00,
        description: "anything",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

      let response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 15.00,
        description: "anything",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = response.body;

    response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', id);
    expect(response.body).toHaveProperty('user_id', userId);
    expect(response.body).toHaveProperty('amount', "15.00");
    expect(response.body).toHaveProperty('type', 'withdraw');
  });

});
