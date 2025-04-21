import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ database: "alimydb" })
export class LookOver {
  @PrimaryGeneratedColumn()
  key: number = 0;

  @Column()
  email: string = null;

  @Column()
  paper: string = null;

  @Column()
  total_score: number = 0;

  @Column()
  rank: number = 0;

  @Column()
  look_over: boolean = false;

  @Column()
  join: boolean = false;

  @Column("bigint")
  use_time: number = 0;
}