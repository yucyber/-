import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ database: "examydb" })
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	email: string;

	@Column({ nullable: true })
	cypher: string;

	@Column({ nullable: true })
	account: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	captcha: string;

	@Column({ nullable: true })
	nowtime_captcha: number;

	@Column({ default: false })
	interviewer: boolean;

	@Column({ nullable: true })
	session: string;
}