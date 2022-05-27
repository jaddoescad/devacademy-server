import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1653676031823 implements MigrationInterface {
    name = 'initial1653676031823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time_watched" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "lessonId" character varying NOT NULL, "lessonIdd" character varying, CONSTRAINT "PK_2a21195bb8b3dc37b437f86f919" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "instructor" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "instructorTitle" character varying, "description" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6222960ab4f2b68e84bc00bfeeb" UNIQUE ("email"), CONSTRAINT "PK_ccc0348eefb581ca002c05ef2f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."course_category_enum" AS ENUM('admin', 'editor', 'ghost')`);
        await queryRunner.query(`CREATE TABLE "course" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" text NOT NULL, "description" text, "instructorId" integer NOT NULL, "category" "public"."course_category_enum", "promoVideo" text, "promoImage" text, "tags" text array NOT NULL DEFAULT '{}', "sectionOrder" text array NOT NULL DEFAULT '{}', "publishedStatus" text, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "section" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" text NOT NULL, "courseId" character varying NOT NULL, "lessonOrder" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_3c41d2d699384cc5e8eac54777d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lesson" ("idd" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" text NOT NULL, "sectionId" character varying NOT NULL, "videoEmbedUrl" text, "videoUri" text, "videoState" text, "articleText" text, "isArticle" boolean, CONSTRAINT "PK_e61f3af016e90d9d90b94d3be54" PRIMARY KEY ("idd"))`);
        await queryRunner.query(`ALTER TABLE "time_watched" ADD CONSTRAINT "FK_213b940b74a8e82da651636b032" FOREIGN KEY ("lessonIdd") REFERENCES "lesson"("idd") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_32d94af473bb59d808d9a68e17b" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "section" ADD CONSTRAINT "FK_c61e35b7deed3caab17e821144a" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson" ADD CONSTRAINT "FK_70eb01d08acf5be68e3a17451b0" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lesson" DROP CONSTRAINT "FK_70eb01d08acf5be68e3a17451b0"`);
        await queryRunner.query(`ALTER TABLE "section" DROP CONSTRAINT "FK_c61e35b7deed3caab17e821144a"`);
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_32d94af473bb59d808d9a68e17b"`);
        await queryRunner.query(`ALTER TABLE "time_watched" DROP CONSTRAINT "FK_213b940b74a8e82da651636b032"`);
        await queryRunner.query(`DROP TABLE "lesson"`);
        await queryRunner.query(`DROP TABLE "section"`);
        await queryRunner.query(`DROP TABLE "course"`);
        await queryRunner.query(`DROP TYPE "public"."course_category_enum"`);
        await queryRunner.query(`DROP TABLE "instructor"`);
        await queryRunner.query(`DROP TABLE "time_watched"`);
    }

}
