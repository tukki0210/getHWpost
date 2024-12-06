"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_api_1 = require("@slack/web-api");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
jest.mock('@slack/web-api');
jest.mock('puppeteer-core');
jest.mock('@sparticuz/chromium');
const mockPostMessage = jest.fn();
web_api_1.WebClient.mockImplementation(() => ({
    chat: { postMessage: mockPostMessage },
}));
// puppeteerのモック
const mockLaunch = jest.fn();
puppeteer_core_1.default.launch = mockLaunch;
// getPostByPrefのモック
jest.mock('./index', () => ({
    ...jest.requireActual('./index'),
    getPostByPref: jest.fn(),
}));
//# sourceMappingURL=index.test.js.map