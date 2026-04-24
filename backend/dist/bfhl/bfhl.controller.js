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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BfhlController = void 0;
const common_1 = require("@nestjs/common");
const bfhl_service_1 = require("./bfhl.service");
let BfhlController = class BfhlController {
    constructor(bfhlService) {
        this.bfhlService = bfhlService;
    }
    health() {
        return { status: 'ok', service: 'bfhl-backend' };
    }
    process(body) {
        if (!Array.isArray(body?.data)) {
            throw new common_1.HttpException({ is_success: false, error: 'Invalid input' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const result = this.bfhlService.processData(body.data);
        return {
            is_success: true,
            user_id: this.bfhlService.userId,
            email_id: this.bfhlService.email,
            college_roll_number: this.bfhlService.roll,
            ...result,
        };
    }
};
exports.BfhlController = BfhlController;
__decorate([
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BfhlController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('/bfhl'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BfhlController.prototype, "process", null);
exports.BfhlController = BfhlController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [bfhl_service_1.BfhlService])
], BfhlController);
//# sourceMappingURL=bfhl.controller.js.map