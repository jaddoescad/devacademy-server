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
import { Instructor } from "./Instructor";
import { Section } from "./Section";

export enum Category {
  ADMIN = "admin",
  EDITOR = "editor",
  GHOST = "ghost",
}



@ObjectType()
@Entity()
export class Course extends BaseEntity {
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

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  description: string;

  @Field()
  @Column()
  instructorId: string;

  @Field(() => Instructor)
  @ManyToOne(() => Instructor, (instructor) => instructor.courses)
  instructor: Instructor;

  @Field(() => [Section], { nullable: true })
  @OneToMany(() => Section, (section) => section.course)
  sections: Section[];

  @Field(() => String, { nullable: true })
  @Column({
    type: "enum",
    enum: Category,
    nullable: true,
  })
  category: Category;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  promoVideo: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  promoImage: string;

  @Field(() => [String])
  @Column("text", {array:true,nullable: false, default: [] })
  tags: string[];

  @Field(() => [String])
  @Column("text", {array:true,nullable: false, default: [] })
  sectionOrder: string[];

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  publishedStatus = 'draft';


  // @Field(() => [String], { nullable: true })
  // @Column("simple-array", {   nullable: true })
  // sectionOrder: string[];
}
