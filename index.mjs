import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'


export const handler = async (event, context) => {

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    const postDataObject = {
        'kSNoJo': '',
        'kSNoGe': '',
        'kjKbnRadioBtn': '1',
        'nenreiInput': '',
        'tDFK1CmbBox': '29', //奈良県
        'tDFK2CmbBox': '',
        'tDFK3CmbBox': '',
        'sKGYBRUIJo1': '',
        'sKGYBRUIGe1': '',
        'sKGYBRUIJo2': '',
        'sKGYBRUIGe2': '',
        'sKGYBRUIJo3': '',
        'sKGYBRUIGe3': '',
        'freeWordInput': '',
        'nOTKNSKFreeWordInput': '',
        'searchBtn': '%E6%A4%9C%E7%B4%A2',
        'kJNoJo1': '',
        'kJNoGe1': '',
        'kJNoJo2': '',
        'kJNoGe2': '',
        'kJNoJo3': '',
        'kJNoGe3': '',
        'kJNoJo4': '',
        'kJNoGe4': '',
        'kJNoJo5': '',
        'kJNoGe5': '',
        'jGSHNoJo': '',
        'jGSHNoChuu': '',
        'jGSHNoGe': '',
        'kyujinkensu': '0',
        'iNFTeikyoRiyoDantaiID': '',
        'searchClear': '0',
        'siku1Hidden': '',
        'siku2Hidden': '',
        'siku3Hidden': '',
        'kiboSuruSKSU1Hidden': '09%2C4+', //希望職種１
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

    // オブジェクトを入力用の文字列に変換する
    const postData = Object.entries(postDataObject).map(data => data.join('=')).join('&')


    page.on('request', interceptedRequest => {

        if (interceptedRequest.isNavigationRequest() && interceptedRequest.redirectChain().length === 0) {
            interceptedRequest.continue({
                method: 'POST',
                postData: postData,
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

    const results = await page.evaluate(() => {
        const elements = document.querySelectorAll('form table.kyujin.mt1.noborder');
        return Array.from(elements).map(element => {
            const Occupation = element.querySelector('tr.kyujin_head table td:nth-child(2) div').textContent;

            const leftData = element.querySelector('.kyujin_body .left-side');
            const companyName = leftData.querySelector('tr:nth-child(2) td:nth-child(2) div').textContent;
            const jobDirection = leftData.querySelector('tr:nth-child(4) td:nth-child(2) div').textContent
            const jobStyle = leftData.querySelector('tr:nth-child(5) td:nth-child(2) div').textContent;
            const jobSaraly = leftData.querySelector('tr:nth-child(6) td:nth-child(2) div').textContent;

            const jobURL = element.querySelector('.kyujin_foot #ID_kyujinhyoBtn').getAttribute('href').substring(2);

            return {
                Occupation,
                companyName,
                jobDirection,
                jobStyle,
                jobSaraly,
                jobURL
            }
        })
    })


    await browser.close();

    results.map(result => {
        const message = `
            職種：${result.Occupation}\n
            会社：${result.companyName}\n
            仕事の内容：${result.jobDirection}\n
            雇用形態：${result.jobStyle}\n
            賃金：${result.jobSaraly}\n
            求人票：'https://www.hellowork.mhlw.go.jp/kensaku/' ${result.jobURL}
        `
        console.log(message)

        const endpoint = 'https://slack.com/api/chat.postMessage';

        const res = fetch(endpoint, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: process.env.SLACK_TOKEN,
                channel: process.env.SLACK_CHANNEL,
                text: message
            })
        })
    })
}

