import { handler, createPostData, getPostByPref, postSlack } from './index';

import { WebClient } from '@slack/web-api';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

jest.mock('@slack/web-api');
jest.mock('puppeteer-core');
jest.mock('@sparticuz/chromium');

const mockPostMessage = jest.fn();
(WebClient as jest.Mock).mockImplementation(() => ({
    chat: { postMessage: mockPostMessage },
}))

// puppeteerのモック
const mockLaunch = jest.fn();
puppeteer.launch = mockLaunch;

// getPostByPrefのモック
jest.mock('./index',()=>({
    ...jest.requireActual('./index'),
    getPostByPref: jest.fn(),
}))
