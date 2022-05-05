"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseResolver = void 0;
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const Course_1 = require("../entities/Course");
const uuid_1 = require("uuid");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Section_1 = require("../entities/Section");
const Lesson_1 = require("../entities/Lesson");
let PaginatedCourses = class PaginatedCourses {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Course_1.Course]),
    __metadata("design:type", Array)
], PaginatedCourses.prototype, "courses", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], PaginatedCourses.prototype, "count", void 0);
PaginatedCourses = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedCourses);
let OrderedLessonsInMultipleSections = class OrderedLessonsInMultipleSections {
};
__decorate([
    (0, type_graphql_1.Field)(() => Section_1.Section),
    __metadata("design:type", Section_1.Section)
], OrderedLessonsInMultipleSections.prototype, "nextSection", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Section_1.Section),
    __metadata("design:type", Section_1.Section)
], OrderedLessonsInMultipleSections.prototype, "currentSection", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Lesson_1.Lesson),
    __metadata("design:type", Lesson_1.Lesson)
], OrderedLessonsInMultipleSections.prototype, "currentLesson", void 0);
OrderedLessonsInMultipleSections = __decorate([
    (0, type_graphql_1.ObjectType)()
], OrderedLessonsInMultipleSections);
let CourseResolver = class CourseResolver {
    courses(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = yield ormconfig_1.default.getRepository(Course_1.Course)
                .createQueryBuilder("course")
                .orderBy('course."createdAt"', "ASC")
                .leftJoinAndSelect("course.instructor", "instructor")
                .limit(limit)
                .offset(offset)
                .getMany();
            const totalCount = yield ormconfig_1.default.getRepository(Course_1.Course).count();
            return {
                courses: qb,
                count: totalCount,
            };
        });
    }
    course({ req }, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = yield ormconfig_1.default.getRepository(Course_1.Course)
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
            }
            else {
                return null;
            }
        });
    }
    instructorCourses({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = yield ormconfig_1.default.getRepository(Course_1.Course)
                .createQueryBuilder("course")
                .where("course.instructorId = :instructorId", {
                instructorId: req.session.userId,
            })
                .orderBy('course."createdAt"', "ASC")
                .getMany();
            return qb;
        });
    }
    instructorCourse({ req }, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = yield ormconfig_1.default.getRepository(Course_1.Course)
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
        });
    }
    createCourse(title, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return Course_1.Course.create({
                id: (0, uuid_1.v4)(),
                title: title,
                instructorId: req.session.userId,
            }).save();
        });
    }
    createSection(title, sectionId, courseId, sectionOrder, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ormconfig_1.default.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(Section_1.Section)
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
                    .update(Course_1.Course)
                    .set({
                    sectionOrder: sectionOrder,
                })
                    .where("id = :id", {
                    id: courseId,
                })
                    .execute();
            }));
            return true;
        });
    }
    changeSectionOrder(courseId, sectionOrder, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield Course_1.Course.findOneBy({ id: courseId });
            if (!course) {
                return null;
            }
            if (typeof sectionOrder !== "undefined") {
                yield Course_1.Course.update({ id: courseId }, { sectionOrder: sectionOrder });
                return course;
            }
            return null;
        });
    }
    changeSectionTitle(sectionId, title, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const section = yield ormconfig_1.default.getRepository(Section_1.Section)
                .createQueryBuilder("section")
                .leftJoin("section.course", "course")
                .where("section.id = :sectionId", { sectionId: sectionId })
                .where("course.instructorId = :id", { id: req.session.userId })
                .getOne();
            if (!section) {
                return null;
            }
            if (typeof title !== "undefined" && title !== "") {
                yield Section_1.Section.update({ id: sectionId }, { title: title });
                return section;
            }
            return null;
        });
    }
    setVideoUrl(lessonId, videoEmbedUrl, videoUri, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield ormconfig_1.default.getRepository(Lesson_1.Lesson)
                .createQueryBuilder("lesson")
                .leftJoin("lesson.section", "section")
                .leftJoin("section.course", "course")
                .where("lesson.id = :lessonId", { lessonId: lessonId })
                .where("course.instructorId = :id", { id: req.session.userId })
                .getOne();
            if (!lesson) {
                return null;
            }
            if (typeof videoEmbedUrl !== undefined &&
                videoUri !== undefined &&
                videoEmbedUrl !== null &&
                videoUri !== null) {
                yield Lesson_1.Lesson.update({ id: lessonId }, { videoEmbedUrl: videoEmbedUrl, videoUri: videoUri });
                return lesson;
            }
            return null;
        });
    }
    setArticleText(lessonId, articleText, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield ormconfig_1.default.getRepository(Lesson_1.Lesson)
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
                if (lesson.isArticle === false ||
                    lesson.isArticle === null ||
                    lesson.isArticle === undefined) {
                    yield Lesson_1.Lesson.update({ id: lessonId }, { isArticle: true, articleText: articleText });
                }
                else {
                    yield Lesson_1.Lesson.update({ id: lessonId }, { articleText: articleText });
                }
                return lesson;
            }
            return null;
        });
    }
    deleteArticle(lessonId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield ormconfig_1.default.getRepository(Lesson_1.Lesson)
                .createQueryBuilder("lesson")
                .leftJoin("lesson.section", "section")
                .leftJoin("section.course", "course")
                .where("lesson.id = :lessonId", { lessonId: lessonId })
                .where("course.instructorId = :id", { id: req.session.userId })
                .getOne();
            if (!lesson) {
                return null;
            }
            yield Lesson_1.Lesson.update({ id: lessonId }, { isArticle: false, articleText: null });
            return lesson;
        });
    }
    changeLessonOrderDifferentSection(nextSectionId, currentSectionId, currentLessonId, currentLessonOrder, nextLessonOrder, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextSection = yield Section_1.Section.findOneBy({ id: nextSectionId });
            const currentSection = yield Section_1.Section.findOneBy({ id: currentSectionId });
            if (!nextSection || !currentSection) {
                return null;
            }
            if (typeof nextSection !== "undefined" &&
                typeof currentSection !== "undefined") {
                yield ormconfig_1.default.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    transactionalEntityManager
                        .createQueryBuilder()
                        .update(Section_1.Section)
                        .set({ lessonOrder: nextLessonOrder })
                        .where("id = :id", {
                        id: nextSectionId,
                    })
                        .execute();
                    transactionalEntityManager
                        .createQueryBuilder()
                        .update(Section_1.Section)
                        .set({ lessonOrder: currentLessonOrder })
                        .where("id = :id", {
                        id: currentSectionId,
                    })
                        .execute();
                    transactionalEntityManager
                        .createQueryBuilder()
                        .update(Lesson_1.Lesson)
                        .where("id = :id", {
                        id: currentLessonId,
                    })
                        .set({ section: nextSection, sectionId: nextSectionId })
                        .execute();
                }));
                const currentLesson = yield Lesson_1.Lesson.findOneBy({ id: currentLessonId });
                const course = yield Course_1.Course.findOneBy({
                    id: "77",
                });
                if (currentLesson) {
                    return {
                        currentSection,
                        nextSection,
                        currentLesson,
                    };
                }
                else {
                    return null;
                }
            }
            return null;
        });
    }
    changeLessonOrderSameSection(sectionId, lessonOrder, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const section = yield Section_1.Section.findOneBy({ id: sectionId });
            if (!section) {
                return null;
            }
            if (typeof section !== "undefined") {
                yield Section_1.Section.update({ id: sectionId }, { lessonOrder: lessonOrder });
                return section;
            }
            return null;
        });
    }
    createLesson(title, sectionId, lessonId, lessonOrder, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ormconfig_1.default.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(Lesson_1.Lesson)
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
                    .update(Section_1.Section)
                    .set({
                    lessonOrder: lessonOrder,
                })
                    .where("id = :id", {
                    id: sectionId,
                })
                    .execute();
            }));
            return true;
        });
    }
    updateCourse(id, title) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield Course_1.Course.findOneBy({ id });
            if (!course) {
                return null;
            }
            if (typeof title !== "undefined") {
                yield Course_1.Course.update({ id }, { title });
            }
            return course;
        });
    }
    deleteCourse(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Course_1.Course.delete({ id });
            return true;
        });
    }
    deleteSection(sectionId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield Course_1.Course.findOneBy({ id: courseId });
            if (course) {
                var sectionOrder = course.sectionOrder;
                console.log(sectionOrder);
                const index = sectionOrder.indexOf(sectionId);
                if (index > -1) {
                    sectionOrder.splice(index, 1);
                }
                else {
                    return false;
                }
                yield ormconfig_1.default.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    transactionalEntityManager
                        .createQueryBuilder()
                        .update(Course_1.Course)
                        .set({ sectionOrder })
                        .where("id = :id", { id: course.id })
                        .execute();
                    transactionalEntityManager
                        .createQueryBuilder()
                        .delete()
                        .from(Section_1.Section)
                        .where("id = :id", { id: sectionId })
                        .execute();
                }));
                return true;
            }
            else {
                return false;
            }
        });
    }
    deleteLesson(sectionId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const section = yield Section_1.Section.findOneBy({ id: sectionId });
            if (section) {
                var lessonOrder = section.lessonOrder;
                const index = lessonOrder.indexOf(lessonId);
                if (index > -1) {
                    lessonOrder.splice(index, 1);
                }
                else {
                    return false;
                }
                yield ormconfig_1.default.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    transactionalEntityManager
                        .createQueryBuilder()
                        .update(Section_1.Section)
                        .set({ lessonOrder })
                        .where("id = :id", { id: section.id })
                        .execute();
                    transactionalEntityManager
                        .createQueryBuilder()
                        .delete()
                        .from(Lesson_1.Lesson)
                        .where("id = :id", { id: lessonId })
                        .execute();
                }));
                return true;
            }
            else {
                return false;
            }
        });
    }
    changeLessonTitle(lessonId, title, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield ormconfig_1.default.getRepository(Lesson_1.Lesson)
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
                yield Lesson_1.Lesson.update({ id: lessonId }, { title: title });
                return lesson;
            }
            return null;
        });
    }
    lesson({ req }, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const qb = yield ormconfig_1.default.getRepository(Lesson_1.Lesson)
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
            }
            else {
                return null;
            }
        });
    }
    saveLandingPage(courseId, title, description, promoImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = Course_1.Course.findOneBy({ id: courseId });
            if (!course) {
                return null;
            }
            if (typeof title !== "undefined" && title !== "") {
                if (promoImage !== "" ||
                    promoImage !== null ||
                    promoImage !== undefined) {
                    yield Course_1.Course.update({ id: courseId }, { title: title, description: description, promoImage: promoImage });
                }
                else {
                    yield Course_1.Course.update({ id: courseId }, { title: title, description: description });
                }
                return course;
            }
            return null;
        });
    }
    createPublished(courseId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield ormconfig_1.default.getRepository(Course_1.Course)
                .createQueryBuilder("course")
                .where("course.id = :courseId", { courseId: courseId })
                .leftJoinAndSelect("course.sections", "sections")
                .leftJoinAndSelect("sections.lessons", "lessons")
                .getOne();
            if (!course) {
                return null;
            }
            yield ormconfig_1.default.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                transactionalEntityManager.query(`
      insert into course ("id", "title", "instructorId", "description", "promoImage", "publishedStatus", "sectionOrder")
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
        )
      ON CONFLICT (id) 
      DO UPDATE 
      SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      "promoImage" = EXCLUDED."promoImage",
      "publishedStatus" = EXCLUDED."publishedStatus",
      "sectionOrder" = EXCLUDED."sectionOrder";`, [
                    courseId + "_published",
                    course.title,
                    course.instructorId,
                    course.description,
                    course.promoImage,
                    "published",
                    course.sectionOrder,
                ]);
                const sections = course === null || course === void 0 ? void 0 : course.sections;
                if ((sections === null || sections === void 0 ? void 0 : sections.length) && sections.length > 0) {
                    for (let i = 0; i < sections.length; i++) {
                        const section = sections[i];
                        transactionalEntityManager.query(`
          insert into section ("id", "title", "courseId", "lessonOrder")
          values (
            $1,
            $2,
            $3,
            $4
            )
          ON CONFLICT (id) 
          DO UPDATE 
          SET title = EXCLUDED.title,
          "courseId" = EXCLUDED."courseId",
          "lessonOrder" = EXCLUDED."lessonOrder";`, [
                            section.id + "_published",
                            section.title,
                            section.courseId + "_published",
                            section.lessonOrder,
                        ]);
                        const lessons = section.lessons;
                        for (let j = 0; j < lessons.length; j++) {
                            const lesson = lessons[j];
                            transactionalEntityManager.query(`
              insert into lesson ("id", "title", "sectionId", "videoEmbedUrl", "videoUri", "videoState", "articleText", "isArticle")
              values (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8
                )
              ON CONFLICT (id) 
              DO UPDATE 
              SET title = EXCLUDED.title,
              "sectionId" = EXCLUDED."sectionId",
              "videoEmbedUrl" = EXCLUDED."videoEmbedUrl",
              "videoUri" = EXCLUDED."videoUri",
              "videoState" = EXCLUDED."videoState",
              "articleText" = EXCLUDED."articleText",
              "isArticle" = EXCLUDED."isArticle";`, [
                                lesson.id + "_published",
                                lesson.title,
                                lesson.sectionId + "_published",
                                lesson.videoEmbedUrl,
                                lesson.videoUri,
                                lesson.videoState,
                                lesson.articleText,
                                lesson.isArticle,
                            ]);
                        }
                    }
                }
            }));
            const course_published = yield ormconfig_1.default.getRepository(Course_1.Course)
                .createQueryBuilder("course")
                .where("course.id = :courseId", { courseId: courseId + "_published" })
                .leftJoinAndSelect("course.sections", "sections")
                .leftJoinAndSelect("sections.lessons", "lessons")
                .getOne();
            return course_published;
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedCourses),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("offset", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "courses", null);
__decorate([
    (0, type_graphql_1.Query)(() => Course_1.Course, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "course", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Course_1.Course]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "instructorCourses", null);
__decorate([
    (0, type_graphql_1.Query)(() => Course_1.Course),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "instructorCourse", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("title")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "createCourse", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("title")),
    __param(1, (0, type_graphql_1.Arg)("sectionId")),
    __param(2, (0, type_graphql_1.Arg)("courseId")),
    __param(3, (0, type_graphql_1.Arg)("sectionOrder", (type) => [String])),
    __param(4, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "createSection", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("courseId")),
    __param(1, (0, type_graphql_1.Arg)("sectionOrder", (type) => [String])),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "changeSectionOrder", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Section_1.Section),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("sectionId")),
    __param(1, (0, type_graphql_1.Arg)("title")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "changeSectionTitle", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Lesson_1.Lesson),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("lessonId")),
    __param(1, (0, type_graphql_1.Arg)("videoEmbedUrl")),
    __param(2, (0, type_graphql_1.Arg)("videoUri")),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "setVideoUrl", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Lesson_1.Lesson),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("lessonId")),
    __param(1, (0, type_graphql_1.Arg)("articleText")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "setArticleText", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Lesson_1.Lesson),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("lessonId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "deleteArticle", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => OrderedLessonsInMultipleSections),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("nextSectionId")),
    __param(1, (0, type_graphql_1.Arg)("currentSectionId")),
    __param(2, (0, type_graphql_1.Arg)("currentLessonId")),
    __param(3, (0, type_graphql_1.Arg)("currentLessonOrder", (type) => [String])),
    __param(4, (0, type_graphql_1.Arg)("nextLessonOrder", (type) => [String])),
    __param(5, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array, Array, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "changeLessonOrderDifferentSection", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Section_1.Section),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("sectionId")),
    __param(1, (0, type_graphql_1.Arg)("lessonOrder", (type) => [String])),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "changeLessonOrderSameSection", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("title")),
    __param(1, (0, type_graphql_1.Arg)("sectionId")),
    __param(2, (0, type_graphql_1.Arg)("lessonId")),
    __param(3, (0, type_graphql_1.Arg)("lessonOrder", (type) => [String])),
    __param(4, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "createLesson", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Course_1.Course, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("title", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "updateCourse", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "deleteCourse", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "deleteSection", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("sectionId")),
    __param(1, (0, type_graphql_1.Arg)("lessonId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "deleteLesson", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Lesson_1.Lesson),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("lessonId")),
    __param(1, (0, type_graphql_1.Arg)("title")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "changeLessonTitle", null);
__decorate([
    (0, type_graphql_1.Query)(() => Lesson_1.Lesson, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "lesson", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("courseId")),
    __param(1, (0, type_graphql_1.Arg)("title")),
    __param(2, (0, type_graphql_1.Arg)("description")),
    __param(3, (0, type_graphql_1.Arg)("promoImage")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "saveLandingPage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Course_1.Course),
    __param(0, (0, type_graphql_1.Arg)("courseId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseResolver.prototype, "createPublished", null);
CourseResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], CourseResolver);
exports.CourseResolver = CourseResolver;
//# sourceMappingURL=course.js.map