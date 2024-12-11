import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { WebClient } from '@slack/web-api'


interface JobPost {
    Occupation: string | null;
    companyName: string | null;
    jobDirection: string | null;
    jobStyle: string | null;
    jobSaraly: string | null;
    postDate: string | null;
    jobURL: string | null;
}

type PostData = {
    prefNum: number,
    kiboSyokusyu?: string,
    freeWord?: string
}

export const createPostData = ({ prefNum, kiboSyokusyu = '09%2C10%2C4%20%2C5', freeWord = '' }: PostData): string => {
    const postDataObject = {
        'kSNoJo': '',
        'kSNoGe': '',
        'kjKbnRadioBtn': '1',
        'nenreiInput': '',
        'tDFK1CmbBox': prefNum,
        'tDFK2CmbBox': '',
        'tDFK3CmbBox': '',
        'sKGYBRUIJo1': '',
        'sKGYBRUIGe1': '',
        'sKGYBRUIJo2': '',
        'sKGYBRUIGe2': '',
        'sKGYBRUIJo3': '',
        'sKGYBRUIGe3': '',
        'freeWordInput': freeWord,
        'nOTKNSKFreeWordInput': '',
        'searchBtn': '%E6%A4%9C%E7%B4%A2',
        'iNFTeikyoRiyoDantaiID': '',
        'searchClear': '0',
        'siku1Hidden': '',
        'siku2Hidden': '',
        'siku3Hidden': '',
        'kiboSuruSKSU1Hidden': kiboSyokusyu,
        'kiboSuruSKSU2Hidden': '',
        'kiboSuruSKSU3Hidden': '',
        'summaryDisp': 'false',
        'searchInitDisp': '0',
        'screenId': 'GECA110010',
        'action': '',
        'codeAssistType': '',
        'codeAssistKind': '',
        'codeAssistCode': '',
        'codeAssistItemCode': '',
        'codeAssistItemName': '',
        'codeAssistDivide': '',
        'maba_vrbs': 'infTkRiyoDantaiBtn%2CsearchShosaiBtn%2CsearchBtn%2CsearchNoBtn%2CsearchClearBtn%2CdispDetailBtn%2CkyujinhyoBtn',
        'preCheckFlg': 'false',
    }
    // オブジェクトを入力用の文字列に変換して返す
    return Object.entries(postDataObject).map(data => data.join('=')).join('&');
}

export const getPostByPref = async (data: string): Promise<JobPost[]> => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', interceptedRequest => {

        if (interceptedRequest.isNavigationRequest() && interceptedRequest.redirectChain().length === 0) {
            interceptedRequest.continue({
                method: 'POST',
                postData: data,
                headers: {
                    ...interceptedRequest.headers(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        } else {
            interceptedRequest.continue();
        }
    });

    const url = 'https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do'

    await page.goto(url)

    const results: JobPost[] = await page.evaluate(() => {
        const elements = document.querySelectorAll('form table.kyujin.mt1.noborder');
        return Array.from(elements).map(element => {
            const Occupation = element.querySelector('tr.kyujin_head table td:nth-child(2) div')?.textContent ?? null;
            const leftData = element.querySelector('.kyujin_body .left-side');
            const companyName = leftData?.querySelector('tr:nth-child(2) td:nth-child(2) div')?.textContent ?? null;
            const jobDirection = leftData?.querySelector('tr:nth-child(4) td:nth-child(2) div')?.textContent ?? null;
            const jobStyle = leftData?.querySelector('tr:nth-child(5) td:nth-child(2) div')?.textContent ?? null;
            const jobSaraly = leftData?.querySelector('tr:nth-child(6) td:nth-child(2) div')?.textContent?.replace(/\s+/g, "") ?? null;
            const postDate = element.querySelector('tr:nth-child(2) div.fs13.ml01')?.textContent ?? null;
            const jobURL = element.querySelector('.kyujin_foot #ID_kyujinhyoBtn')?.getAttribute('href')?.substring(2) ?? null;

            return { Occupation, companyName, jobDirection, jobStyle, jobSaraly, postDate, jobURL };
        })
    })

    await browser.close();

    return results
}

export const postSlack = async (token: string, channel: string, results: JobPost[], date: string): Promise<void> => {

    const client = new WebClient(token);

    await Promise.all(results.map(async (result) => {

        if (date === result.postDate) {
            const text = [
                '【本日の新着求人】',
                `会社名：${result.companyName}`,
                `職種：${result.Occupation}`,
                `仕事の内容：${result.jobDirection}`,
                `雇用形態：${result.jobStyle}`,
                `賃金：${result.jobSaraly}`,
                `日付：${result.postDate}`,
                `求人票：https://www.hellowork.mhlw.go.jp/kensaku/${result.jobURL}`
            ].join('\n');

            const response = await client.chat.postMessage({ channel, text });
        }
    }))
}


export const handler = async (event: unknown, context: unknown): Promise<void> => {

    const token = process.env.SLACK_TOKEN ?? "";

    const date = new Date();

    const dateString = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

    // 25 滋賀県
    // 26 京都府
    // 27 大阪府
    // 28 兵庫県
    // 29 奈良県

    const kiboSyokusyu = '09%2C10%2C4%20%2C5'
    //希望職種１　「ウェブデザイナー」「ソフトウェア開発技術者、プログラマー」「その他の情報処理・通信技術者」

    const channel_kyoto = process.env.SLACK_CHANNEL_KYOTO ?? "";

    const results_kyoto = await getPostByPref(createPostData({ prefNum: 26 }));
    await postSlack(token, channel_kyoto, results_kyoto, dateString);
    const results_DX_kyoto = await getPostByPref(createPostData({ prefNum: 26, kiboSyokusyu: '', freeWord: 'DX' }));
    await postSlack(token, channel_kyoto, results_DX_kyoto, dateString);


    const channel_osaka = process.env.SLACK_CHANNEL_OSAKA ?? "";
    const results_osaka = await getPostByPref(createPostData({ prefNum: 27 }));
    await postSlack(token, channel_osaka, results_osaka, dateString);
    const results_DX_osaka = await getPostByPref(createPostData({ prefNum: 27, kiboSyokusyu: '', freeWord: 'DX' }));
    await postSlack(token, channel_osaka, results_DX_osaka, dateString);


    const channel_nara = process.env.SLACK_CHANNEL_NARA ?? "";
    const results_nara = await getPostByPref(createPostData({ prefNum: 29 }));
    await postSlack(token, channel_nara, results_nara, dateString);
    const results_DX_nara = await getPostByPref(createPostData({ prefNum: 29, kiboSyokusyu: '', freeWord: 'DX' }));
    await postSlack(token, channel_nara, results_DX_nara, dateString);
}