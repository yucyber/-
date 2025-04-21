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
const const_1 = require("../../src/config/const");
const typeorm_1 = require("typeorm");
let Candidate = class Candidate {
    constructor() {
        this.email = null;
        this.paper = null;
        this.test_name = null;
        this.test_level = null;
        this.test_status = const_1.TEST_STATUS.NODO;
        this.program_answer = '';
        this.program_language = '';
        this.submit_num = 0;
        this.score = 0;
        this.answer_begin = 0;
        this.answer_end = 0;
        this.time_end = 0;
        this.watch = true;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Candidate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "paper", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "test_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "test_level", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "test_status", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { default: null }),
    __metadata("design:type", Array)
], Candidate.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)("longtext"),
    __metadata("design:type", String)
], Candidate.prototype, "program_answer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Candidate.prototype, "program_language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Candidate.prototype, "submit_num", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Candidate.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint"),
    __metadata("design:type", Number)
], Candidate.prototype, "answer_begin", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint"),
    __metadata("design:type", Number)
], Candidate.prototype, "answer_end", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint"),
    __metadata("design:type", Number)
], Candidate.prototype, "time_end", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Candidate.prototype, "watch", void 0);
Candidate = __decorate([
    (0, typeorm_1.Entity)({ database: "alimydb" })
], Candidate);
exports.default = Candidate;
//# sourceMappingURL=Candidate.js.map