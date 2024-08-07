var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../util/Define"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Define_1 = __importDefault(require("../../util/Define"));
    (0, Define_1.default)(Array.prototype, "filterNullish", function () {
        return this.filter(v => v !== undefined && v !== null);
    });
    (0, Define_1.default)(Array.prototype, "filterFalsey", function (removeZeroAndEmptyString = false) {
        return this.filter(v => removeZeroAndEmptyString ? v : v !== undefined && v !== null && v !== false);
    });
});