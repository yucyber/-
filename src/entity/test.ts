import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TestPaper } from './TestPaper';
import { Comment } from './Comment';

@Entity({ database: "examydb" })
export class Test {
  @PrimaryGeneratedColumn()
  key: number;

  @Column({ default: '1' })
  num: string;

  @Column()
  test_name: string;

  @Column("longtext", { nullable: true })
  test: string;

  @OneToMany(() => Comment, comment => comment.test)
  comments: Comment[];

  @ManyToOne(() => TestPaper, paper => paper.tests, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'paperKey', referencedColumnName: 'key' })
  paper: TestPaper;

  @Column({ nullable: false, update: false })
  paperKey: number;

  @Column("longtext", { nullable: true })
  answer: string;

  @Column("simple-array", { nullable: true })
  tags: string[];

  @Column({ default: 'normal' })
  level: string;

  @Column({ default: 0 })
  point: number;

  @Column("json", { nullable: true })
  testCases: {
    input: string[];
    output: string[];
  }[];

  @Column("json", { nullable: true })
  template: {
    code: string;
    language: string;
  };
}