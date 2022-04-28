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
exports.Course = exports.Category = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Instructor_1 = require("./Instructor");
const Section_1 = require("./Section");
var Category;
(function (Category) {
    Category["ADMIN"] = "admin";
    Category["EDITOR"] = "editor";
    Category["GHOST"] = "ghost";
})(Category = exports.Category || (exports.Category = {}));
let Course = class Course extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], Course.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Course.prototype, "createdAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Course.prototype, "updatedAt", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Course.prototype, "instructorId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Instructor_1.Instructor),
    (0, typeorm_1.ManyToOne)(() => Instructor_1.Instructor, (instructor) => instructor.courses),
    __metadata("design:type", Instructor_1.Instructor)
], Course.prototype, "instructor", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Section_1.Section], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => Section_1.Section, (section) => section.course),
    __metadata("design:type", Array)
], Course.prototype, "sections", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Category,
        nullable: true,
    }),
    __metadata("design:type", String)
], Course.prototype, "category", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "promoVideo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Course.prototype, "promoImage", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)("text", { array: true, nullable: false, default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "tags", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)("text", { array: true, nullable: false, default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "sectionOrder", void 0);
Course = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Course);
exports.Course = Course;
//# sourceMappingURL=Course.js.map