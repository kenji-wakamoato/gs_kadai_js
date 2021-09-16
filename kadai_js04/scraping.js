// ３つの呪文を読み込んでください
const { WebClient } = require('@slack/web-api');
const rp = require('promise-request-retry');
const { JSDOM } = require('jsdom')
// スクレイパーのAPIキー
const API_KEY = '';
const NUM_RETRIES = 5;
// slackのAPIキーとチャンネルID
const SLACK_TOKEN  = '';
const SLACK_CHANENL = '';
// slackに送るメッセージ
var send_text = ''

// YahooニュースのITカテゴリTOP
const url = 'https://news.yahoo.co.jp/categories/it'
// 待ち時間を設定するための関数
const wait = ms => new Promise(resolve => setTimeout(() => resolve(true), ms));
// APIにデータを取りに行くための関数
const makeConcurrentRequest = async (inputUrl) => {
// YahooニュースのURLとスクレイパーのAPIキーをスクレイパーのAPIURLに送る
  try {
      options = {
          uri: `http://api.scraperapi.com/`,//スクレイパーのURL
          qs: {
              'api_key': API_KEY,
              'url': inputUrl
          },
          retry : NUM_RETRIES,//リトライの回数
          verbose_logging : false, //ログを残す設定
          accepted: [ 200, 404, 403 ],//許可用のステータスコード
          factor: 2,//
          resolveWithFullResponse: true//これを指定しないとデータが帰ってこない
      }
      const response = await rp(options);//2行目の宣言をoptionで呼び出し await→最初の処理が終わるまで待て
      return response//19行目に対して結果を返す
  } catch (e) {//try catch（エラー処理）でエラーの内容を返す
      return e
  }
}
//slackにメッセージを送るための関数(参考ページより写経)

const sendSlackMessage = async (send_message) => {//slackmessageにパラメータを代入

  console.log(send_message )
  
  const client = new WebClient(SLACK_TOKEN);

  const res = await client.chat.postMessage({
    channel: SLACK_CHANENL,
    text:send_message
  });

  // 投稿に成功すると `ok` フィールドに `true` が入る。
  console.log(res.ok);
  return res.ok
}

(async () => {

  console.log("start")
  try {
    response =  makeConcurrentRequest(url)

    console.log("makeConcurrentRequest")
    await response.then(fullResponse => {

    console.log(fullResponse.statusCode )
      if(fullResponse.statusCode == 200){
        // 取得してきたニュースをのテキストを格納する変数

        // リクエストで返ってきたDOM
        const dom = new JSDOM(fullResponse.body)

        // トピックリストのDOMを取得
        const topicsListItem = dom.window.document.querySelectorAll('.topics ul li')

        console.log(topicsListItem.length )
        // querySelectorAllの返り値はNodeListなのでforEachで回す
        topicsListItem.forEach(element => {
          const item = element.children[0] // 各ニュースを取得

          const news = {
            text: item.textContent.trim(), // ニュースのテキスト
            href: item.href  // ニュースのリンク先
          }

          // テキストとリンク先を結合し、文末に改行を入れる
          send_text += `${news.text} ${news.href}\n`
        })
      }else {
        // if the response status code isn't 200, then log the message
        console.log(fullResponse.message)
      }
    }).catch(error => {
          console.log(error)
    })

  } catch (error){
      console.log(error)
  }

  // if no freeThreads available then wait for 200ms before retrying.
  await wait(200);

  console.log("roop-out" )
  console.log(send_text )
  slackres = await sendSlackMessage(send_text)
  console.log(slackres)

})();


