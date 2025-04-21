"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../src/config/utils");
const typeorm_1 = require("typeorm");
const Interview_1 = __importDefault(require("../../entity/Interview"));
const responseClass_1 = __importDefault(require("../../config/responseClass"));
const const_1 = require("../../config/const");
exports.default = async (ctx) => {
    try {
        const { inform } = ctx.request.body;
        const interviewRepository = (0, typeorm_1.getRepository)(Interview_1.default);
        const newInterview = new Interview_1.default();
        const roomNum = (0, utils_1.createSixNum)();
        newInterview.interviewer = inform.interviewer;
        newInterview.candidate = inform.candidate;
        newInterview.interview_room = roomNum;
        newInterview.interview_begin_time = inform.interview_begin_time;
        newInterview.interviewer_link = (0, utils_1.createInterviewLink)({ interviewer: true, roomNum });
        newInterview.candidate_link = (0, utils_1.createInterviewLink)({ interviewer: false, roomNum });
        newInterview.interview_status = const_1.INTERVIEW_STATUS.NO;
        newInterview.evaluation = "";
        newInterview.comment = "";
        await interviewRepository.save(newInterview);
        ctx.status = 200;
        ctx.body = new responseClass_1.default(200, "创建成功", { status: true, data: newInterview });
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = new responseClass_1.default(500, "服务器错误", { status: false, error: error instanceof Error ? error.message : String(error) });
    }
};
//# sourceMappingURL=create.js.map