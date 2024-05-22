"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__endOfTheDayWithDate = exports.unixToDate = exports.dateFormated = exports.addDaysThenReturnUnix = exports.daysPerTypeSouscription = exports.nowInUnix = exports.nowPlusDays = exports.date = exports.now = void 0;
const moment_1 = __importDefault(require("moment"));
moment_1.default.locale("fr");
const now = ({ options }) => {
    options = options ? options : {};
    return (0, moment_1.default)().format("LTS, L");
};
exports.now = now;
const date = () => new Date();
exports.date = date;
const nowPlusDays = ({ options: { days } }) => {
    return (0, moment_1.default)().add(days, 'days').format("LTS, L");
};
exports.nowPlusDays = nowPlusDays;
const nowInUnix = ({ options }) => {
    options = options ? options : {};
    return (0, moment_1.default)((0, exports.now)({ options }), 'DD-MM-YYYY').unix() || (0, moment_1.default)().unix();
};
exports.nowInUnix = nowInUnix;
const daysPerTypeSouscription = ({ type }) => {
    let days = 0;
    switch (parseInt(type)) {
        case 1:
            return days = 30;
            break;
        case 2:
            return days = 60;
            break;
        case 3:
            return days = 90;
            break;
        case 4:
            return days = 365;
            break;
        default:
            return days = 30;
            break;
    }
};
exports.daysPerTypeSouscription = daysPerTypeSouscription;
const addDaysThenReturnUnix = ({ days }) => {
    return (0, moment_1.default)().add((days), 'days').unix();
};
exports.addDaysThenReturnUnix = addDaysThenReturnUnix;
const dateFormated = ({ longDate }) => {
    return (0, moment_1.default)(longDate).format("L");
};
exports.dateFormated = dateFormated;
const unixToDate = ({ unix }) => {
    return moment_1.default.unix(unix).format("DD/MM/YYYY");
};
exports.unixToDate = unixToDate;
const __endOfTheDayWithDate = ({ date }) => {
    return (0, moment_1.default)(date).endOf('day').unix();
};
exports.__endOfTheDayWithDate = __endOfTheDayWithDate;
