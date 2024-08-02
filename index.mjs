import { LambdaClient, UpdateFunctionCodeCommand } from '@aws-sdk/client-lambda'
import puppeteer from 'puppeteer'

const client = new LambdaClient({ region: 'ap-northeast-1' });

const params = {
    FunctionName: 'getHWpost',
    ZipFile: Buffer.from('...')
}

const command = new UpdateFunctionCodeCommand(params);

try {
    const data = await client.send(command);
    console.log(data);


    const url_nara = 'https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do'

    const browser = await puppeteer.launch()
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

    // オブジェクトを入力用の文字列に変換
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

    await page.goto(url_nara)

    const results = await page.evaluate(() => {
        const elements = document.querySelectorAll('form table.kyujin.mt1.noborder')
        return Array.from(elements).map(element => {
            const leftData = element.querySelector('.kyujin_body .left-side');
            const companyName = leftData.querySelector('tr:nth-child(2) td:nth-child(2) div').textContent
            const jobDirection = leftData.querySelector('tr:nth-child(4) td:nth-child(2) div').textContent
            return {
                '会社名': companyName,
                '仕事の内容': jobDirection,
            }
        })
    })


    console.log(results)

    console.log(results)

    await browser.close();

} catch (err) {
    console.log(err);
}