import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import createConnection from "../../../../database";

let connection: Connection;
let password: String;

describe("Create Statement", () => {

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

	it("Should be to Create a Deposit", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "asimov@yahoo.com.br",
			password: "asimov"
		});

		const { token } = responseToken.body;

		const response = await request(app).post('/api/v1/statements/deposit').send({
			description: "primeiro depósito",
			amount: Number(55.25)
		}).set({
			Authorization: `Bearer ${token}`
		});
		expect(response.status).toBe(201);
	});

	it("Should be to Create a Withdraw", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "asimov@yahoo.com.br",
			password: "asimov"
		});

		const { token } = responseToken.body;

		const response = await request(app).post('/api/v1/statements/withdraw').send({
			description: "primeiro saque",
			amount: Number(25.33)
		}).set({
			Authorization: `Bearer ${token}`
		});
		expect(response.status).toBe(201);
	});
});
