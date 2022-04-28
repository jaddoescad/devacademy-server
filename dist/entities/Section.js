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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Course_1 = require("./Course");
const Lesson_1 = require("./Lesson");
let Section = class Section extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Section.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Section.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Section.prototype, "updatedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Section.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Section.prototype, "courseId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Course_1.Course, { nullable: true }),
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.sections, { onDelete: 'CASCADE' }),
    __metadata("design:type", Course_1.Course)
], Section.prototype, "course", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Lesson_1.Lesson], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => Lesson_1.Lesson, (course) => course.section),
    __metadata("design:type", Array)
], Section.prototype, "lessons", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)("text", { array: true, nullable: false, default: [] }),
    __metadata("design:type", Array)
], Section.prototype, "lessonOrder", void 0);
Section = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Section);
exports.Section = Section;
//# sourceMappingURL=Section.js.map