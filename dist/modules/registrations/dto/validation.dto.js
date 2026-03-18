"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdentitySchema = void 0;
const zod_1 = require("zod");
exports.validateIdentitySchema = zod_1.z.object({
// the files are handled by multer, maybe additional metadata can go here
});
