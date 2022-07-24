import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import createConnection from "../../../../database";

let connection: Connection;
let password: String;

describe("get Statement information", () => {

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

	it("Should be to get a statement", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "asimov@yahoo.com.br",
			password: "asimov"
		});

		const { token } = responseToken.body;

		const dep1 = await request(app).post('/api/v1/statements/deposit').send({
			description: "primeiro depósito",
			amount: 55.25
		}).set({
			Authorization: `Bearer ${token}`
		});

		const dep2 = await request(app).post('/api/v1/statements/deposit').send({
			description: "Segundo depósito",
			amount: 25.31
		}).set({
			Authorization: `Bearer ${token}`
		});

		const dep3 = await request(app).post('/api/v1/statements/deposit').send({
			description: "Terceiro depósito",
			amount: 11.33
		}).set({
			Authorization: `Bearer ${token}`
		});

		const { id } = dep2.body;

		const response = await request(app).get(`/api/v1/statements/${id}`).set({
			Authorization: `Bearer ${token}`
		});

		const { description, amount, type } = response.body;

		expect(Number(amount)).toBe(25.31);
		expect(description).toBe('Segundo depósito');
		expect(type).toBe('deposit');

	});

});
