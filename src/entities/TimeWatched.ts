import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Lesson } from "./Lesson";

@ObjectType()
@Entity()
export class TimeWatched extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @CreateDateColumn()
  timestamp: Date;

  @Field(() => String)
  timeWatched: Date;

  @Field()
  @Column()
  lessonId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.timesWatched)
  lesson: Lesson;
}
