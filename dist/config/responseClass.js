"use strict";
// import { loginResponseProps } from "./types";
Object.defineProperty(exports, "__esModule", { value: true });
// const defaultRes = {
//   code: 0,
//   msg: '',
//   data: {},
// }
class loginResponse {
    constructor(code, msg, data) {
        this.res = {};
        this.res = {
            code: code,
            msg: msg,
            data: data,
        };
        // this.res = Object.assign({}, defaultRes, params);
    }
    toJSON() {
        return this.res;
    }
}
exports.default = loginResponse;
//# sourceMappingURL=responseClass.js.map