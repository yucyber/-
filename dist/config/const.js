"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODE = exports.WS_TYPE = exports.INTERVIEW_STATUS = exports.TEST_LEVEL = exports.TEST_STATUS = exports.ORIGINIP = void 0;
exports.ORIGINIP = 'http://localhost:3000';
// 试题状态
var TEST_STATUS;
(function (TEST_STATUS) {
    TEST_STATUS["NODO"] = "\u672A\u505A";
    TEST_STATUS[TEST_STATUS["NODO_KEY"] = 0] = "NODO_KEY";
    TEST_STATUS["DONE"] = "\u5DF2\u89E3\u7B54";
    TEST_STATUS[TEST_STATUS["DONE_KEY"] = -1] = "DONE_KEY";
    TEST_STATUS["DOING"] = "\u5C1D\u8BD5\u8FC7";
    TEST_STATUS[TEST_STATUS["DOING_KEY"] = 1] = "DOING_KEY";
})(TEST_STATUS = exports.TEST_STATUS || (exports.TEST_STATUS = {}));
;
// 试题难度
var TEST_LEVEL;
(function (TEST_LEVEL) {
    TEST_LEVEL["EASY"] = "\u7B80\u5355";
    TEST_LEVEL["MIDDLE"] = "\u4E2D\u7B49";
    TEST_LEVEL["HARD"] = "\u56F0\u96BE";
})(TEST_LEVEL = exports.TEST_LEVEL || (exports.TEST_LEVEL = {}));
// 面试间的状态
var INTERVIEW_STATUS;
(function (INTERVIEW_STATUS) {
    INTERVIEW_STATUS["NO"] = "\u672A\u5F00\u59CB";
    INTERVIEW_STATUS["ING"] = "\u8FDB\u884C\u4E2D";
    INTERVIEW_STATUS["ON"] = "\u5DF2\u7ED3\u675F";
})(INTERVIEW_STATUS = exports.INTERVIEW_STATUS || (exports.INTERVIEW_STATUS = {}));
// websocket 收到信息时的 type
var WS_TYPE;
(function (WS_TYPE) {
    WS_TYPE["CONNECT"] = "connect";
    WS_TYPE["TALK"] = "talk";
    WS_TYPE["CODE"] = "code";
    WS_TYPE["REQ_VIDEO"] = "req-video";
    WS_TYPE["RES_VIDEO"] = "res-video";
    WS_TYPE["VIDEO_OFFER"] = "video-offer";
    WS_TYPE["VIDEO_ANSWER"] = "video-answer";
    WS_TYPE["NEW_ICE_CANDIDATE"] = "new-ice-candidate";
    WS_TYPE["HANG_UP"] = "hang-up";
})(WS_TYPE = exports.WS_TYPE || (exports.WS_TYPE = {}));
// 准备列出业务所需的状态码和响应信息，但目前貌似没有这个必要
exports.STATUS_CODE = {};
//# sourceMappingURL=const.js.map