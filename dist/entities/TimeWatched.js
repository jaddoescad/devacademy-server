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
exports.TimeWatched = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Lesson_1 = require("./Lesson");
let TimeWatched = class TimeWatched extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], TimeWatched.prototype, "id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TimeWatched.prototype, "timestamp", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", Date)
], TimeWatched.prototype, "timeWatched", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimeWatched.prototype, "lessonId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Lesson_1.Lesson, (lesson) => lesson.timesWatched),
    __metadata("design:type", Lesson_1.Lesson)
], TimeWatched.prototype, "lesson", void 0);
TimeWatched = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], TimeWatched);
exports.TimeWatched = TimeWatched;
//# sourceMappingURL=TimeWatched.js.map