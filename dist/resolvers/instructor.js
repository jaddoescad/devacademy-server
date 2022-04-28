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
exports.InstructorResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Instructor_1 = require("../entities/Instructor");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const AuthInput_1 = require("./AuthInput");
const validateRegister_1 = require("../utils/validateRegister");
const sendemail_1 = require("../utils/sendemail");
const uuid_1 = require("uuid");
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let InstructorResponse = class InstructorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], InstructorResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Instructor_1.Instructor, { nullable: true }),
    __metadata("design:type", Instructor_1.Instructor)
], InstructorResponse.prototype, "instructor", void 0);
InstructorResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], InstructorResponse);
let InstructorResolver = class InstructorResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return "";
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructor = yield Instructor_1.Instructor.findOneBy({ email });
            if (!instructor) {
                return true;
            }
            const token = (0, uuid_1.v4)();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, instructor.id, "ex", 1000 * 60 * 60 * 24 * 3);
            (0, sendemail_1.sendEmail)(instructor.email, `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`);
            return true;
        });
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, validateRegister_1.validateRegister)(options);
            if (errors) {
                return { errors };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            var instructor;
            try {
                instructor = yield Instructor_1.Instructor.create({
                    email: options.email,
                    firstName: options.firstName,
                    lastName: options.lastName,
                    password: hashedPassword,
                }).save();
            }
            catch (err) {
                if (err.code === "23505") {
                    return {
                        errors: [
                            {
                                field: "email",
                                message: "email already taken",
                            },
                        ],
                    };
                }
                else {
                    return {
                        errors: [
                            {
                                field: "email",
                                message: err.message,
                            },
                        ],
                    };
                }
            }
            req.session.userId = instructor.id;
            return { instructor };
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.session);
            if (!req.session.userId) {
                return null;
            }
            const user = yield Instructor_1.Instructor.findOneBy({ id: req.session.userId });
            return user;
        });
    }
    logout({ req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => req.session.destroy((err) => {
                res.clearCookie(constants_1.COOKIE_NAME);
                if (err) {
                    console.log("failed to log out");
                    resolve(false);
                    return;
                }
                else
                    resolve(true);
            }));
        });
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length <= 2) {
                return {
                    errors: [
                        {
                            field: "newPassword",
                            message: "length must be greater than 2",
                        },
                    ],
                };
            }
            const key = constants_1.FORGET_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
            if (!userId) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "token expired",
                        },
                    ],
                };
            }
            const instructorId = parseInt(userId);
            const instructor = yield Instructor_1.Instructor.findOneBy({ id: instructorId });
            if (!instructor) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "user no longer exists",
                        },
                    ],
                };
            }
            yield Instructor_1.Instructor.update({ id: instructorId }, {
                password: yield argon2_1.default.hash(newPassword),
            });
            yield redis.del(key);
            req.session.userId = instructor.id;
            return { instructor };
        });
    }
    login(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const instructor = yield Instructor_1.Instructor.findOneBy({ email: options.email });
            if (!instructor) {
                return {
                    errors: [
                        {
                            field: "email",
                            message: "that email doesn't exist",
                        },
                    ],
                };
            }
            const valid = yield argon2_1.default.verify(instructor.password, options.password);
            if (!valid) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "incorrect password",
                        },
                    ],
                };
            }
            req.session.userId = instructor.id;
            return {
                instructor,
            };
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Instructor_1.Instructor, Object]),
    __metadata("design:returntype", void 0)
], InstructorResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InstructorResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => InstructorResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuthInput_1.RegisterInput, Object]),
    __metadata("design:returntype", Promise)
], InstructorResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Query)(() => Instructor_1.Instructor, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstructorResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => InstructorResponse),
    __param(0, (0, type_graphql_1.Arg)("token")),
    __param(1, (0, type_graphql_1.Arg)("newPassword")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InstructorResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => InstructorResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuthInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], InstructorResolver.prototype, "login", null);
InstructorResolver = __decorate([
    (0, type_graphql_1.Resolver)(Instructor_1.Instructor)
], InstructorResolver);
exports.InstructorResolver = InstructorResolver;
//# sourceMappingURL=instructor.js.map