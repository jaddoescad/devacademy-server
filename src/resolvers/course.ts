import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Ctx,
  UseMiddleware,
  Int,
  Field,
  ObjectType,
} from "type-graphql";
import { Course } from "../entities/Course";
// import { User } from "../entities/User";

import AppDataSource from "../ormconfig";
import { Section } from "../entities/Section";
import { Lesson } from "../entities/Lesson";

@ObjectType()
class PaginatedCourses {
  @Field(() => [Course])
  courses: Course[];
  @Field()
  count: number;
}

@ObjectType()
class OrderedLessonsInMultipleSections {
  @Field(() => Section)
  nextSection: Section;
  @Field(() => Section)
  currentSection: Section;
  @Field(() => Lesson)
  currentLesson: Lesson;
}

@Resolver()
export class CourseResolver {
  @Query(() => PaginatedCourses)
  async courses(
    @Arg("limit", () => Int) limit: number,
    @Arg("offset", () => Int) offset: number
  ): Promise<PaginatedCourses> {
    const qb = await AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .orderBy('course."createdAt"', "ASC")
      .leftJoinAndSelect("course.instructor", "instructor")
      .limit(limit)
      .offset(offset)
      .getMany();

    const totalCount = await AppDataSource.getRepository(Course).count();

    return {
      courses: qb,
      count: totalCount,
    };
  }

  // @Query(() => Course, { nullable: true })
  // course(@Arg("id") id: string): Promise<Course | null> {
  //   return Course.findOneBy({ id: id });
  // }

  @Query(() => Course, { nullable: true })
  async course(@Ctx() { req }: MyContext, @Arg("id") courseId: string) {
    const qb = await AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .where("course.instructorId = :instructorId", {
        instructorId: req.session.userId,
      })
      .leftJoinAndSelect("course.sections", "sections")
      .where("course.id = :courseId", {
        courseId: courseId,
      })
      .leftJoinAndSelect("sections.lessons", "lessons")
      .where("course.id = :courseId", {
        courseId: courseId,
      })
      .getOne();

    if (qb) {
      return qb;
    } else {
      return null;
    }
  }

  @Query(() => [Course])
  async instructorCourses(@Ctx() { req }: MyContext): Promise<Course[]> {
    const qb = await AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .where("course.instructorId = :instructorId", {
        instructorId: req.session.userId,
      })
      .orderBy('course."createdAt"', "ASC")
      .getMany();
    return qb;
  }

  @Query(() => Course)
  async instructorCourse(
    @Ctx() { req }: MyContext,
    @Arg("courseId") courseId: string
  ): Promise<Course | null> {
    const qb = await AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .where("course.instructorId = :instructorId", {
        instructorId: req.session.userId,
      })
      .where("course.id = :courseId", {
        courseId: courseId,
      })
      .orderBy('course."createdAt"', "ASC")
      .getOne();
    return qb;
  }

  @Mutation(() => Course)
  @UseMiddleware(isAuth)
  async createCourse(
    @Arg("title") title: string,
    @Ctx() { req }: MyContext
  ): Promise<Course> {
    return Course.create({
      title: title,
      instructorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createSection(
    @Arg("title") title: string,
    @Arg("sectionId") sectionId: string,
    @Arg("courseId") courseId: string,
    @Arg("sectionOrder", (type) => [String]) sectionOrder: string[],
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Section)
        .values([
          {
            id: sectionId,
            title: title,
            courseId: courseId,
          },
        ])
        .execute();

      transactionalEntityManager
        .createQueryBuilder()
        .update(Course)
        .set({
          sectionOrder: sectionOrder,
        })
        .where("id = :id", {
          id: courseId,
        })
        .execute();
    });

    return true;
  }

  @Mutation(() => Course)
  @UseMiddleware(isAuth)
  async changeSectionOrder(
    @Arg("courseId") courseId: string,
    @Arg("sectionOrder", (type) => [String]) sectionOrder: string[],
    @Ctx() { req }: MyContext
  ): Promise<Course | null> {
    const course = await Course.findOneBy({ id: courseId });
    if (!course) {
      return null;
    }
    if (typeof sectionOrder !== "undefined") {
      await Course.update({ id: courseId }, { sectionOrder: sectionOrder });
      return course;
    }
    return null;
  }

  @Mutation(() => Section)
  @UseMiddleware(isAuth)
  async changeSectionTitle(
    @Arg("sectionId") sectionId: string,
    @Arg("title") title: string,
    @Ctx() { req }: MyContext
  ): Promise<Section | null> {
    const section = await AppDataSource.getRepository(Section)
      .createQueryBuilder("section")
      .leftJoin("section.course", "course")
      .where("section.id = :sectionId", { sectionId: sectionId })
      .where("course.instructorId = :id", { id: req.session.userId })
      .getOne();

    if (!section) {
      return null;
    }

    if (typeof title !== "undefined" && title !== "") {
      await Section.update({ id: sectionId }, { title: title });
      return section;
    }

    return null;
  }

  //add video url to lesson
  @Mutation(() => Lesson)
  @UseMiddleware(isAuth)
  async setVideoUrl(
    @Arg("lessonId") lessonId: string,
    @Arg("videoEmbedUrl") videoEmbedUrl: string,
    @Arg("videoUri") videoUri: string,
    @Ctx() { req }: MyContext
  ): Promise<Lesson | null> {
    const lesson = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lesson")
      .leftJoin("lesson.section", "section")
      .leftJoin("section.course", "course")
      .where("lesson.id = :lessonId", { lessonId: lessonId })
      .where("course.instructorId = :id", { id: req.session.userId })
      .getOne();

    if (!lesson) {
      return null;
    }

    if (
      typeof videoEmbedUrl !== undefined &&
      videoUri !== undefined &&
      videoEmbedUrl !== null &&
      videoUri !== null
    ) {
      await Lesson.update(
        { id: lessonId },
        { videoEmbedUrl: videoEmbedUrl, videoUri: videoUri }
      );
      return lesson;
    }

    return null;
  }

  //add video url to lesson
  @Mutation(() => Lesson)
  @UseMiddleware(isAuth)
  async setArticleText(
    @Arg("lessonId") lessonId: string,
    @Arg("articleText") articleText: string,
    @Ctx() { req }: MyContext
  ): Promise<Lesson | null> {
    const lesson = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lesson")
      .leftJoin("lesson.section", "section")
      .leftJoin("section.course", "course")
      .where("lesson.id = :lessonId", { lessonId: lessonId })
      .where("course.instructorId = :id", { id: req.session.userId })
      .getOne();

    if (!lesson) {
      return null;
    }

    if (typeof articleText !== undefined && articleText !== null) {
      if (
        lesson.isArticle === false ||
        lesson.isArticle === null ||
        lesson.isArticle === undefined
      ) {
        await Lesson.update(
          { id: lessonId },
          { isArticle: true, articleText: articleText }
        );
      } else {
        await Lesson.update({ id: lessonId }, { articleText: articleText });
      }
      return lesson;
    }

    return null;
  }

  //add video url to lesson
  @Mutation(() => Lesson)
  @UseMiddleware(isAuth)
  async deleteArticle(
    @Arg("lessonId") lessonId: string,
    @Ctx() { req }: MyContext
  ): Promise<Lesson | null> {
    const lesson = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lesson")
      .leftJoin("lesson.section", "section")
      .leftJoin("section.course", "course")
      .where("lesson.id = :lessonId", { lessonId: lessonId })
      .where("course.instructorId = :id", { id: req.session.userId })
      .getOne();

    if (!lesson) {
      return null;
    }

    await Lesson.update(
      { id: lessonId },
      { isArticle: false, articleText: null }
    );

    return lesson;
  }

  @Mutation(() => OrderedLessonsInMultipleSections)
  @UseMiddleware(isAuth)
  async changeLessonOrderDifferentSection(
    @Arg("nextSectionId") nextSectionId: string,
    @Arg("currentSectionId") currentSectionId: string,
    @Arg("currentLessonId") currentLessonId: string,
    @Arg("currentLessonOrder", (type) => [String]) currentLessonOrder: string[],
    @Arg("nextLessonOrder", (type) => [String]) nextLessonOrder: string[],
    @Ctx() { req }: MyContext
  ): Promise<OrderedLessonsInMultipleSections | null> {
    const nextSection = await Section.findOneBy({ id: nextSectionId });
    const currentSection = await Section.findOneBy({ id: currentSectionId });

    // const nextLesson = await Lesson.findOneBy({ id: nextLessonId });

    if (!nextSection || !currentSection) {
      return null;
    }
    if (
      typeof nextSection !== "undefined" &&
      typeof currentSection !== "undefined"
    ) {
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        transactionalEntityManager
          .createQueryBuilder()
          .update(Section)
          .set({ lessonOrder: nextLessonOrder })
          .where("id = :id", {
            id: nextSectionId,
          })
          .execute();

        transactionalEntityManager
          .createQueryBuilder()
          .update(Section)
          .set({ lessonOrder: currentLessonOrder })
          .where("id = :id", {
            id: currentSectionId,
          })
          .execute();

        transactionalEntityManager
          .createQueryBuilder()
          .update(Lesson)
          .where("id = :id", {
            id: currentLessonId,
          })
          .set({ section: nextSection, sectionId: nextSectionId })
          .execute();
      });

      const currentLesson = await Lesson.findOneBy({ id: currentLessonId });
      const course = await Course.findOneBy({
        id: "77",
      });
      if (currentLesson) {
        return {
          currentSection,
          nextSection,
          currentLesson,
        };
      } else {
        return null;
      }
    }
    return null;
  }

  @Mutation(() => Section)
  @UseMiddleware(isAuth)
  async changeLessonOrderSameSection(
    @Arg("sectionId") sectionId: string,
    @Arg("lessonOrder", (type) => [String]) lessonOrder: string[],
    @Ctx() { req }: MyContext
  ): Promise<Section | null> {
    const section = await Section.findOneBy({ id: sectionId });
    if (!section) {
      return null;
    }
    if (typeof section !== "undefined") {
      await Section.update({ id: sectionId }, { lessonOrder: lessonOrder });
      return section;
    }
    return null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createLesson(
    @Arg("title") title: string,
    @Arg("sectionId") sectionId: string,
    @Arg("lessonId") lessonId: string,
    @Arg("lessonOrder", (type) => [String]) lessonOrder: string[],
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Lesson)
        .values([
          {
            id: lessonId,
            title: title,
            sectionId: sectionId,
          },
        ])
        .execute();

      transactionalEntityManager
        .createQueryBuilder()
        .update(Section)
        .set({
          lessonOrder: lessonOrder,
        })
        .where("id = :id", {
          id: sectionId,
        })
        .execute();
    });

    return true;
  }

  @Mutation(() => Course, { nullable: true })
  @UseMiddleware(isAuth)
  async updateCourse(
    @Arg("id") id: string,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Course | null> {
    const course = await Course.findOneBy({ id });
    if (!course) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Course.update({ id }, { title });
    }
    return course;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteCourse(@Arg("id") id: string): Promise<boolean> {
    await Course.delete({ id });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteSection(
    @Arg("id") sectionId: string,
    @Arg("courseId") courseId: string
  ): Promise<boolean> {
    const course = await Course.findOneBy({ id: courseId });
    if (course) {
      var sectionOrder = course.sectionOrder;
      //remove id from sectionOrder
      console.log(sectionOrder);

      const index = sectionOrder.indexOf(sectionId);
      if (index > -1) {
        sectionOrder.splice(index, 1);
      } else {
        return false;
      }
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        transactionalEntityManager
          .createQueryBuilder()
          .update(Course)
          .set({ sectionOrder })
          .where("id = :id", { id: course.id })
          .execute();
        transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Section)
          .where("id = :id", { id: sectionId })
          .execute();
      });
      return true;
    } else {
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteLesson(
    @Arg("sectionId") sectionId: string,
    @Arg("lessonId") lessonId: string
  ): Promise<boolean> {
    const section = await Section.findOneBy({ id: sectionId });
    if (section) {
      var lessonOrder = section.lessonOrder;
      //remove id from sectionOrder

      const index = lessonOrder.indexOf(lessonId);
      if (index > -1) {
        lessonOrder.splice(index, 1);
      } else {
        return false;
      }
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        transactionalEntityManager
          .createQueryBuilder()
          .update(Section)
          .set({ lessonOrder })
          .where("id = :id", { id: section.id })
          .execute();
        transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Lesson)
          .where("id = :id", { id: lessonId })
          .execute();
      });
      return true;
    } else {
      return false;
    }
  }

  @Mutation(() => Lesson)
  @UseMiddleware(isAuth)
  async changeLessonTitle(
    @Arg("lessonId") lessonId: string,
    @Arg("title") title: string,
    @Ctx() { req }: MyContext
  ): Promise<Lesson | null> {
    const lesson = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lesson")
      .leftJoin("lesson.section", "section")
      .leftJoin("section.course", "course")
      .where("lesson.id = :lessonId", { lessonId: lessonId })
      .where("course.instructorId = :id", { id: req.session.userId })
      .getOne();

    if (!lesson) {
      return null;
    }

    if (typeof title !== "undefined" && title !== "") {
      await Lesson.update({ id: lessonId }, { title: title });
      return lesson;
    }

    return null;
  }

  @Query(() => Lesson, { nullable: true })
  async lesson(@Ctx() { req }: MyContext, @Arg("id") lessonId: string) {
    const qb = await AppDataSource.getRepository(Lesson)
      .createQueryBuilder("lesson")
      .leftJoin("lesson.section", "section")
      .leftJoin("section.course", "course")
      .where("course.instructorId = :instructorId", {
        instructorId: req.session.userId,
      })
      .where("lesson.id = :lessonId", {
        lessonId: lessonId,
      })
      .getOne();

    if (qb) {
      return qb;
    } else {
      return null;
    }
  }

  //change course title for hassan

  @Mutation(() => Course)
  @UseMiddleware(isAuth)
  async saveLandingPage(
    @Arg("courseId") courseId: string,
    @Arg("title") title: string,
    @Arg("description") description: string,
    @Arg("promoImage") promoImage: string
  ): Promise<Course | null> {
    const course = Course.findOneBy({ id: courseId });

    if (!course) {
      return null;
    }

    if (typeof title !== "undefined" && title !== "") {
      if (
        promoImage !== "" ||
        promoImage !== null ||
        promoImage !== undefined
      ) {
        await Course.update(
          { id: courseId },
          { title: title, description: description, promoImage: promoImage }
        );
      } else {
        await Course.update(
          { id: courseId },
          { title: title, description: description }
        );
      }
      return course;
    }

    return null;
  }
}
