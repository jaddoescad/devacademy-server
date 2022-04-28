import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { CourseResolver } from "./resolvers/course";
import { InstructorResolver } from "./resolvers/instructor";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import { COOKIE_NAME, __prod__ } from "./constants";
import cors from "cors";
import { DataSource } from "typeorm";
// import { __prod__ } from "./constants";
import { Course } from "./entities/Course";
// import path from "path";
import { Instructor } from "./entities/Instructor";

import "reflect-metadata";
import { Section } from "./entities/Section";
import { Lesson } from "./entities/Lesson";
import { TimeWatched } from "./entities/TimeWatched";
import path from "path";
import AppDataSource  from "./ormconfig";
// 
// export const AppDataSource = new DataSource({
//   type: "postgres",
//   username: "postgres",
//   password: "postgres",
//   database: "devacademy" ,
//   synchronize: true,
//   logging: true,
//   migrationsRun: true,
//   migrations: [path.join(__dirname, "./migration/*")],
//   migrationsTableName: 'migrations',
//   entities: [Course, Instructor, Section, Lesson, TimeWatched],
// });

const main = async () => {

  await AppDataSource.initialize()
    .then(async () => {
      console.log("connected");
    })
    .catch((error) => console.log(error));

  const app = express();
  let RedisStore = connectRedis(session);

  const redis = new Redis();

  // //fix after localdev only
  app.use(
    cors({
      credentials: true,
      origin: [
        "https://studio.apollographql.com",
        "http://localhost:4000/graphql",
        "http://localhost:3000",
      ],
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      secret: "aslkdfjoiqrfrmfr12312",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: !__prod__,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
      },
    })
  );

  //delete courses and users
  // await Lesson.delete({});
  // await Section.delete({});
  // await Course.delete({});
  // await Instructor.delete({});

  //add graphql endpoint with apollo-server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, CourseResolver, InstructorResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => {
      return { req, res, redis };
    },
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => console.log("Server listening on port 4000"));
};

main().catch((err) => {
  console.error(err);
});
