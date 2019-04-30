import csvParseSync from "csv-parse/lib/sync";
import * as fs from "fs";
import { WebClient } from '@slack/web-api';
import Schedule from "./schedule";

const filepath = "./schedule.csv"

try {
  //ファイルの読み込み
  const csvstr:string = fs.readFileSync(filepath, "UTF-8");
  //カラム名の日本語を変換
  const convertedstr:string = csvstr.replace("ユーザー/組織システムID", "userId")
                                    .replace("氏名/組織名", "userName")
                                    .replace("ＩＤ（システムＩＤ：自動発番）", "scheduleId")
                                    .replace("開始日", "startDate")
                                    .replace("開始時刻", "startTime")
                                    .replace("終了日", "endDate")
                                    .replace("終了時刻", "endTime")
                                    .replace("予定", "scheduleType")
                                    .replace("予定詳細", "scheduleTitle")
                                    .replace("場所", "place")
                                    .replace("場所詳細", "placeDiscription")
                                    .replace("内容", "discription")
                                    .replace("情報公開レベル", "accessType")
                                    .replace("外出区分", "outside")
                                    .replace("重要度", "importance")
                                    .replace("予約種別", "appointmentType")
                                    .replace("フラグ", "flag")
                                    .replace("アイコン番号", "iconNo")
                                    .replace("承認依頼", "approvalRequest")
                                    .replace("確認通知メール", "notification")
                                    .replace("所有者ID", "ownerId")
                                    .replace("所有者名", "ownerName")
  //csvをオブジェクトの配列に変換
  const scheduleList:Array<Schedule> = csvParseSync(convertedstr, { skip_lines_with_error:true, columns:true });
  // 次の営業日(yyyy/mm/dd)を取得。
  const nextBusinessDate:string = getNextBusinessDay(scheduleList);

  //休暇予定者のリスト
  let offMembers :Array<string> = [];
  //朝当番予定者のリスト
  let turnMemberskak :Array<string> = [];
  let turnMembersrin :Array<string> = [];
  let turnMembersbis :Array<string> = [];

  for(let schedule of scheduleList) {
    if(nextBusinessDate === schedule.startDate) {
      switch(schedule.scheduleType) {
        case "休暇":
          offMembers.push(schedule.scheduleTitle);
          break;
        case "朝当番_格付":
          turnMemberskak.push(schedule.scheduleTitle);
          break;
        case "朝当番_稟議":
          turnMembersrin.push(schedule.scheduleTitle);
          break;
        case "朝当番_BIS計":
          turnMembersbis.push(schedule.scheduleTitle);
          break;
        default:
          break;
      }
    }
  }
  //通知するものがあれば通知
  if (offMembers.length > 0 ||
      turnMemberskak.length > 0 ||
      turnMembersrin.length > 0 ||
      turnMembersbis.length > 0 ) {

  //通知メッセージ作成
  //日付部分
  const wd = ['日', '月', '火', '水', '木', '金', '土'];
  const messageDate = new Date(nextBusinessDate);
  const month = messageDate.getMonth()+1;
  const date = messageDate.getDate();
  const day = messageDate.getDay();
  const messageDateString = month + '/' + date + ' (' + wd[day] + ')';

  //担当者部分
  const trunMemberkakString = getMemberString(turnMemberskak);
  const trunMemberrinString = getMemberString(turnMembersrin);
  const trunMemberbisString = getMemberString(turnMembersbis);
  const offMemberString = getMemberString(offMembers);

  //メッセージ全体
  const message:string = "お疲れ様です。\n"
                     + `${messageDateString} 朝当番になります。\n`
                     + `格付： ${trunMemberkakString}`
                     + `稟議： ${trunMemberrinString}`
                     + `BIS計： ${trunMemberbisString}`
                     + "\n"
                     + "【休暇予定者】\n"
                     + offMemberString
                     + "\n"
                     + "です。\n"
                     + "ご確認をお願いします。\n"

  //slackに投稿
  const web = new WebClient(process.env.SLACK_TOKEN);
  const channel = "CHNSF8E03";
  (async () => {
    await web.chat.postMessage({ text: message, channel: channel });
    //エラー処理？
  })();
}
} catch(err) {
  console.log(err);
}

//次の営業日を取得する。今日～5日後のうち、一番若い日付
//該当なければ5日後を返すが問題なし。
function getNextBusinessDay(scheduleList:Array<Schedule>):string {
  //今日
  const today:Date = new Date();
  //5日後
  let nextBusinessDate:Date = new Date();
  nextBusinessDate.setDate(nextBusinessDate.getDate() + 5);

  let tmpStartDate:Date;
  for(let schedule of scheduleList) {
    if (schedule.startDate == "") {
      continue;
    }

    tmpStartDate = new Date(schedule.startDate)
    if (today < tmpStartDate　&& tmpStartDate < nextBusinessDate) {
      nextBusinessDate = new Date(tmpStartDate);
    }
  }
  return nextBusinessDate.getFullYear() + "/"
       + ("00" + (nextBusinessDate.getMonth()+1)).slice(-2) + "/"
       + ("00" + nextBusinessDate.getDate()).slice(-2);
}

//人のリストを通知用にさん付けで結合し、最後に改行を入れる
function getMemberString(members:Array<string>): string {
  let memberString;
  //朝当番
  if (members.length > 0) {
    memberString = members.join(" さん、") + " さん\n";
  } else {
    memberString = "該当者なし\n";
  }
  return memberString;
}