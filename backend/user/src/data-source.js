"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const MongoDataSource = new typeorm_1.DataSource({
    type: 'mongodb',
    host: 'localhost',
    database: 'userdb',
    entities: ['src/entity/*.js'],
    logging: false,
    synchronize: true,
});
exports.default = MongoDataSource;
