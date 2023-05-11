"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = void 0;
const db_1 = require("./db");
const auth_1 = require("./utils/auth");
const getToken = ({ req }) => {
    const token = req && req.headers.authorization
        ? (0, auth_1.decodeAuthHeader)(req.headers.authorization)
        : null;
    return {
        db: db_1.db,
        userId: token === null || token === void 0 ? void 0 : token.userId,
    };
};
exports.getToken = getToken;
// export const context = {
//   db,
// };
//# sourceMappingURL=context.js.map