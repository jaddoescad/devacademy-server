import { Field, ObjectType } from "type-graphql";

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "./Course";
import { Lesson } from "./Lesson";

@ObjectType()
@Entity()
export class Section extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column({ type: "text" })
  title: string;

  @Field()
  @Column({ type: "text" })
  courseId: string;

  @Field(() => Course, { nullable: true })
  @ManyToOne(() => Course, (course) => course.sections, { onDelete: 'CASCADE' })
  course: Course;

  @Field(() => [Lesson], { nullable: true })
  @OneToMany(() => Lesson, (course) => course.section)
  lessons: Lesson[];

  @Field(() => [String])
  @Column("text", {array:true,nullable: false, default: [] })
  lessonOrder: string[];
}
