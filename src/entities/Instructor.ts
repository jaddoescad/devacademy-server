import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "./Course";

@ObjectType()
@Entity()
export class Instructor extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column()
  firstName: string;

  @Field(() => String)
  @Column()
  lastName: string;

  @Field(() => String, {nullable: true })
  @Column({nullable: true })
  instructorTitle: string;

  @Field(() => String, {nullable: true })
  @Column({nullable: true })
  description: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
