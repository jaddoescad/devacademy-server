"use strict";
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
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const course_1 = require("./resolvers/course");
const instructor_1 = require("./resolvers/instructor");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const cors_1 = __importDefault(require("cors"));
require("reflect-metadata");
const ormconfig_1 = __importDefault(require("./ormconfig"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield ormconfig_1.default.initialize()
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("connected");
    }))
        .catch((error) => console.log(error));
    const app = (0, express_1.default)();
    let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use((0, cors_1.default)({
        credentials: true,
        origin: [
            "https://studio.apollographql.com",
            "http://localhost:4000/graphql",
            "http://localhost:3000",
        ],
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        secret: "aslkdfjoiqrfrmfr12312",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: !constants_1.__prod__,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
        },
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, course_1.CourseResolver, instructor_1.InstructorResolver],
            validate: false,
        }),
        context: ({ req, res }) => {
            return { req, res, redis };
        },
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(4000, () => console.log("Server listening on port 4000"));
});
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=index.js.map