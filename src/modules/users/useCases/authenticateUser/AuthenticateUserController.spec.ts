import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

import createConnection from "../../../../database";

let connection: Connection;
let password: String;

describe("Authanticate User", () => {

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

	it("Should not be to authenticate is user not exists", async () => {

		const responseToken = await request(app).post('/api/v1/sessions').send({
			email: "samba@yahoo.com.br",
			password: "samba"
		});

		expect(responseToken.status).toBe(401);
	});
});
