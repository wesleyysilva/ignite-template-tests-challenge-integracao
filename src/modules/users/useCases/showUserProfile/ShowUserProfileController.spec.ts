import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import createConnection from "../../../../database";

let connection: Connection;
let password: String;


describe("Show Profile Controller", () => {

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

	it("Should be able to show profile", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "asimov@yahoo.com.br",
			password: "asimov"
		});

		const { token } = responseToken.body;

		const response = await request(app).get('/api/v1/profile').set({
			Authorization: `Bearer ${token}`
		});

		expect(response.status).toBe(200);
	});

	it("Should not be able show profile if invalid user not exists.", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "asimov@yahoo.com.br",
			password: "asimov"
		});

		const { user, token } = responseToken.body;

		await connection.query(`delete from users where id = '${user.id}'`);

		const response = await request(app).get('/api/v1/profile').set({
			Authorization: `Bearer ${token}`
		});

		expect(response.status).toBe(404);
	});

});
