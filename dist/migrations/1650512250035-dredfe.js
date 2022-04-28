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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dredfe1650512250035 = void 0;
class dredfe1650512250035 {
    constructor() {
        this.name = 'dredfe1650512250035';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "lesson" DROP CONSTRAINT "FK_70eb01d08acf5be68e3a17451b0"`);
            yield queryRunner.query(`ALTER TABLE "instructor" RENAME COLUMN "username" TO "firstName"`);
            yield queryRunner.query(`ALTER TABLE "lesson" ADD CONSTRAINT "FK_70eb01d08acf5be68e3a17451b0" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "lesson" DROP CONSTRAINT "FK_70eb01d08acf5be68e3a17451b0"`);
            yield queryRunner.query(`ALTER TABLE "instructor" RENAME COLUMN "firstName" TO "username"`);
            yield queryRunner.query(`ALTER TABLE "lesson" ADD CONSTRAINT "FK_70eb01d08acf5be68e3a17451b0" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.dredfe1650512250035 = dredfe1650512250035;
//# sourceMappingURL=1650512250035-dredfe.js.map