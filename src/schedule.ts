interface Schedule {
  //ユーザー/組織システムID
  userId:string;
  //氏名/組織名
  userName:string;
  //ＩＤ（システムＩＤ：自動発番）
  scheduleId:string;
  //開始日
  startDate:string;
  //開始時刻
  startTime:string;
  //終了日
  endDate:string;
  //終了時刻
  endTime:string;
  //予定
  scheduleType:string;
  //予定詳細
  scheduleTitle:string;
  //場所
  place:string;
  //場所詳細
  placeDiscription:string;
  //内容
  discription:string;
  //情報公開レベル
  accessType:string;
  //外出区分
  outside:string;
  //重要度
  importance:string;
  //予約種別
  appointmentType:string;
  //フラグ
  flag:string;
  //アイコン番号
  iconNo:string;
  //承認依頼
  approvalRequest:string;
  //確認通知メール
  notification:string;
  //所有者ID
  ownerId:string;
  //所有者名
  ownerName:string;
}
export default Schedule;
