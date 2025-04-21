import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Test } from "./Test";

@Entity({ database: "examydb" })
export class TestPaper {
  @PrimaryGeneratedColumn()
  key: number;

  @Column()
  paper_name: string;

  @Column({ default: 0 })
  total_point: number;

  @Column({ default: 0 })
  total_num: number;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  interviewer: string;

  @Column({ default: '' })
  candidate: string;

  @Column({ type: 'bigint', default: 0 })
  time_begin: number;

  @Column({ type: 'bigint', default: 0 })
  time_end: number;

  @Column({ default: false })
  remaining_time: boolean;

  @Column({ default: 60 })
  answer_time: number;

  @OneToMany(() => Test, test => test.paper, {
    cascade: true,
    eager: true
  })
  tests: Test[];
}