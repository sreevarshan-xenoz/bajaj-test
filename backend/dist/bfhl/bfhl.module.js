"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BfhlModule = void 0;
const common_1 = require("@nestjs/common");
const bfhl_controller_1 = require("./bfhl.controller");
const bfhl_service_1 = require("./bfhl.service");
let BfhlModule = class BfhlModule {
};
exports.BfhlModule = BfhlModule;
exports.BfhlModule = BfhlModule = __decorate([
    (0, common_1.Module)({
        controllers: [bfhl_controller_1.BfhlController],
        providers: [bfhl_service_1.BfhlService],
    })
], BfhlModule);
//# sourceMappingURL=bfhl.module.js.map