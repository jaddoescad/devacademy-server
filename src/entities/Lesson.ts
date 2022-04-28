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
import { TimeWatched } from "./TimeWatched";
import { Section } from "./Section";

type videoState = 'Processing' | 'Processed';


@ObjectType()
@Entity()
export class Lesson extends BaseEntity {
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
  @Column()
  sectionId: string;
  
  @Field(() => Section, { nullable: true})
  @ManyToOne(() => Section, (section) => section.lessons , { onDelete: "CASCADE" })
  section: Section;

  @OneToMany(() => TimeWatched, (timeWatched) => timeWatched.lesson)
  timesWatched: TimeWatched[];

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  videoEmbedUrl: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  videoUri: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "text" , nullable: true})
  videoState: videoState;

  @Field(() => String, { nullable: true })
  @Column({ type: "text" , nullable: true})
  articleText: string | null;

  @Field(() => Boolean, { nullable: true })
  @Column({ type: "boolean" , nullable: true})
  isArticle: Boolean;
}