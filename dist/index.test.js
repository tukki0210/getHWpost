import { createPostData } from './index.mjs';
import { WebClient } from '@slack/web-api';
import puppeteer from 'puppeteer-core';
jest.mock('@slack/web-api');
jest.mock('@sparticuz/chromium');
const mockPostMessage = jest.fn();
WebClient.mockImplementation(() => ({
    chat: { postMessage: mockPostMessage },
}));
// puppeteerのモック
const mockLaunch = jest.fn();
puppeteer.launch = mockLaunch;
// getPostByPrefのモック
jest.mock('./index', () => ({
    ...jest.requireActual('./index'),
    getPostByPref: jest.fn(),
}));
describe('createPostData', () => {
    it('should generate correct query string with default kiboSyokusyu', () => {
        const prefNum = 13;
        const result = createPostData({ prefNum });
        // 結果が期待通りであるか検証
        expect(result).toContain('tDFK1CmbBox=13');
        expect(result).toContain('kiboSuruSKSU1Hidden=09%2C10%2C4%20%2C5');
        expect(result).toContain('searchBtn=%E6%A4%9C%E7%B4%A2');
        expect(result).toContain('screenId=GECA110010');
    });
    it('should generate correct query string with custom kiboSyokusyu', () => {
        const prefNum = 27;
        const customKiboSyokusyu = '01%2C02%2C03';
        const result = createPostData({ prefNum, kiboSyokusyu: customKiboSyokusyu });
        // 結果が期待通りであるか検証
        expect(result).toContain('tDFK1CmbBox=27');
        expect(result).toContain(`kiboSuruSKSU1Hidden=${customKiboSyokusyu}`);
        expect(result).toContain('searchBtn=%E6%A4%9C%E7%B4%A2');
        expect(result).toContain('screenId=GECA110010');
    });
    it('should include all required keys in the query string', () => {
        const prefNum = 40;
        const result = createPostData({ prefNum });
        // 全てのキーが結果に含まれるか検証
        const requiredKeys = [
            'kSNoJo', 'kSNoGe', 'kjKbnRadioBtn', 'nenreiInput',
            'tDFK1CmbBox', 'tDFK2CmbBox', 'tDFK3CmbBox', 'sKGYBRUIJo1',
            'sKGYBRUIGe1', 'searchBtn', 'screenId'
        ];
    });
});
// jest.mock('puppeteer-core');
// const mockedPuppeteer = puppeteer as jest.Mocked<typeof puppeteer>;
// describe('getPostByPref', () => {
//     let browserMock: any;
//     let pageMock: any;
//     beforeEach(() => {
//         // モックの設定
//         pageMock = {
//             setRequestInterception: jest.fn(),
//             on: jest.fn(),
//             goto: jest.fn(),
//             evaluate: jest.fn(),
//             close: jest.fn()
//         };
//         browserMock = {
//             newPage: jest.fn().mockResolvedValue(pageMock),
//             close: jest.fn(),
//         };
//         mockedPuppeteer.launch.mockResolvedValue(browserMock);
//     });
//     afterEach(() => {
//         jest.resetAllMocks();
//     })
//     it('should return parsed job posts from the target URL', async () => {
//         // モックデータ
//         const mockJobPosts = [
//             {
//                 Occupation: 'Software Engineer',
//                 companyName: 'Tech Company',
//                 jobDirection: 'Web Development',
//                 jobStyle: 'Full-Time',
//                 jobSaraly: '500000JPY',
//                 postDate: '2024-12-01',
//                 jobURL: '/job/detail/12345',
//             },
//         ];
//         pageMock.evaluate.mockResolvedValue(mockJobPosts);
//         // const data = 'mockPostDataString';
//         // const result = await getPostByPref(data);
//         // 結果を検証
//         // expect(result).toEqual(mockJobPosts);
//         // puppeteerの呼び出しを検証
//         expect(mockedPuppeteer.launch).toHaveBeenCalledWith(expect.objectContaining({
//             headless: true,
//         }));
//         expect(browserMock.newPage).toHaveBeenCalled();
//         expect(pageMock.setRequestInterception).toHaveBeenCalledWith(true);
//         expect(pageMock.goto).toHaveBeenCalledWith('https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do');
//     });
//     it('should handle empty results gracefully', async () => {
//         pageMock.evaluate.mockResolvedValue([]); // 空の配列を返す
//         // const data = 'mockPostDataString';
//         // const result = await getPostByPref(data);
//         // 結果が空であることを確認
//         // expect(result).toEqual([]);
//         // puppeteerの呼び出しを検証
//         expect(browserMock.newPage).toHaveBeenCalled();
//         expect(pageMock.goto).toHaveBeenCalledWith('https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do');
//     });
//     // it('should throw an error if puppeteer fails', async () => {
//     //     mockedPuppeteer.launch.mockRejectedValue(new Error('Puppeteer launch failed'));
//     //     const data = 'mockPostDataString';
//     //     await expect(getPostByPref(data)).rejects.toThrow('Puppeteer launch failed');
//     // });
// });
//# sourceMappingURL=index.test.js.map