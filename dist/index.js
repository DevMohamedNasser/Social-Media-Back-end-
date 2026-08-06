"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const app_controller_1 = __importDefault(require("./app.controller"));
(0, app_controller_1.default)().catch((error) => {
    chalk_1.default.red(console.log(`Failed to start App`, error));
    process.exit(1);
});
