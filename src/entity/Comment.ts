import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Test } from "./Test";

@Entity({ database: "examydb" })
export class Comment {
  @PrimaryGeneratedColumn()
  key: number;

  @Column()
  email: string;

  @Column({ default: 0 })
  like_num: number;

  @Column({ default: 0 })
  dislike_num: number;

  @Column("longtext")
  comments: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Test, test => test.comments)
  @JoinColumn()
  test: Test;
}

export default Comment;