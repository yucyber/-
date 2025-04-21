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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const typeorm_1 = require("typeorm");
const TestPaper_1 = __importDefault(require("./TestPaper"));
const Comment_1 = require("./Comment");
let Test = class Test {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Test.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Test.prototype, "num", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Test.prototype, "test_name", void 0);
__decorate([
    (0, typeorm_1.Column)("longtext", { nullable: true }),
    __metadata("design:type", String)
], Test.prototype, "test", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment_1.Comment, comment => comment.test),
    __metadata("design:type", Array)
], Test.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TestPaper_1.default, paper => paper.tests),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", TestPaper_1.default)
], Test.prototype, "paper", void 0);
__decorate([
    (0, typeorm_1.Column)("longtext", { nullable: true }),
    __metadata("design:type", String)
], Test.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Test.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Test.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Test.prototype, "point", void 0);
Test = __decorate([
    (0, typeorm_1.Entity)({ database: "examydb" })
], Test);
exports.Test = Test;
exports.default = Test;
//# sourceMappingURL=Test.js.map