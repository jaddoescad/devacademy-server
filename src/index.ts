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
import "reflect-metadata";
import AppDataSource  from "./ormconfig";
import 'dotenv-safe/config';


const main = async () => {

  await AppDataSource.initialize()
    .then(async () => {
      console.log("connected");
    })
    .catch((error) => console.log(error));


  const app = express();
  let RedisStore = connectRedis(session);

  const redis = new Redis(process.env.REDIS_URL);
  app.set("proxy", 1);

  // //fix after localdev only
  app.use(
    cors({
      credentials: true,
      origin: process.env.CORS_ORIGIN
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      secret: process.env.SECRET_SESSION,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: __prod__,
        domain: __prod__ ? ".devacademy.com" : undefined,
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

  app.listen(parseInt(process.env.PORT), () => console.log("Server listening on port 4000"));
};

main().catch((err) => {
  console.error(err);
});
