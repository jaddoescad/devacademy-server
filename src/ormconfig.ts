import { DataSource } from "typeorm";
import "reflect-metadata";

export default new DataSource({
    type: "postgres",
    username: "postgres",
    password: "postgres",
    database: "devacademy",
    logging: true,
    synchronize: true,
    entities: [__dirname + '/entities/**/*.ts', __dirname + '/entities/**/*.js'],
    migrations: [__dirname + '/migrations/**/*.ts', __dirname + '/migrations/**/*.js'],
    migrationsTableName: 'migrations',
    
    // entities: [Course, Instructor, Section, Lesson, TimeWatched],
   
  });