import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import createConnection from "../../../../database";

let connection: Connection;
let password: String;

describe("Create Balance", () => {

	beforeAll(async () => {
		connection = await createConnection();
		await connection.runMigrations();

		const id = uuid();
		password = await hash('asimov', 8);

		await connection.query(`insert into users(id, name, password, email,created_at, updated_at)
		      values('${id}', 'asimov', '${password}','asimov@yahoo.com.br', 'now()', 'now()')`);
	});

	afterAll(async () => {
		await connection.dropDatabase();
		await connection.close();
	});

	it("Should be to get a balance", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "asimov@yahoo.com.br",
			password: "asimov"
		});

		const { token } = responseToken.body;


		await request(app).post('/api/v1/statements/deposit').send({
			description: "primeiro depósito",
			amount: 55.25
		}).set({
			Authorization: `Bearer ${token}`
		});

		await request(app).post('/api/v1/statements/deposit').send({
			description: "segundo depósito",
			amount: 33.33
		}).set({
			Authorization: `Bearer ${token}`
		});


		await request(app).post('/api/v1/statements/withdraw').send({
			description: "primeiro saque",
			amount: 5.38
		}).set({
			Authorization: `Bearer ${token}`
		});

		await request(app).post('/api/v1/statements/withdraw').send({
			description: "segundo saque",
			amount: 11.12
		}).set({
			Authorization: `Bearer ${token}`
		});

		const response = await request(app).get('/api/v1/statements/balance').set({
			Authorization: `Bearer ${token}`
		});


		const { statement } = response.body;


		expect(response.status).toBe(200);
		expect(statement.length).toBe(4);
	});

});
