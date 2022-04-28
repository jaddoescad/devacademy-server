"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
require("reflect-metadata");
exports.default = new typeorm_1.DataSource({
    type: "postgres",
    username: "postgres",
    password: "postgres",
    database: "devacademy",
    logging: true,
    synchronize: true,
    entities: [__dirname + '/entities/**/*.ts', __dirname + '/entities/**/*.js'],
    migrations: [__dirname + '/migrations/**/*.ts', __dirname + '/migrations/**/*.js'],
    migrationsTableName: 'migrations',
});
//# sourceMappingURL=ormconfig.js.map