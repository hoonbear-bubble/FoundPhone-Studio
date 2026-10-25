import { lazy, type ComponentType } from "react";
import type { SkinProps } from "../AppSkins";
const system = () => import("./SystemSkins");
const messaging = () => import("./MessagingSkins");
const social = () => import("./SocialSkins");
const media = () => import("./MediaSkins");
const commerce = () => import("./CommerceSkins");
function skin<T>(load: () => Promise<T>, name: keyof T) {
  return lazy(async () => ({
    default: (await load())[name] as ComponentType<SkinProps>,
  }));
}
const mymy = () => import("../vendor/mymy/Apps");
export const catalogSkins = {
  weverse: skin(() => import("./WeverseSkin"), "WeverseSkin"),
  kakao: skin(mymy, "MymyKakao"),
  instagram: skin(mymy, "MymyInstagram"),
  phone: skin(system, "PhoneSkin"),
  contacts: skin(system, "ContactsSkin"),
  photos: skin(system, "PhotosSkin"),
  camera: skin(system, "CameraSkin"),
  safari: skin(system, "SafariSkin"),
  notes: skin(system, "NotesSkin"),
  calendar: skin(system, "CalendarSkin"),
  mail: skin(system, "MailSkin"),
  clock: skin(system, "ClockSkin"),
  reminders: skin(system, "RemindersSkin"),
  files: skin(system, "FilesSkin"),
  music: skin(system, "MusicSkin"),
  maps: skin(system, "MapsSkin"),
  weather: skin(system, "WeatherSkin"),
  wallet: skin(system, "WalletSkin"),
  health: skin(system, "HealthSkin"),
  find: skin(system, "FindSkin"),
  messages: skin(messaging, "MessagesSkin"),
  qq: skin(messaging, "QQSkin"),
  telegram: skin(messaging, "TelegramSkin"),
  discord: skin(messaging, "DiscordSkin"),
  line: skin(messaging, "LineSkin"),
  messenger: skin(messaging, "MessengerSkin"),
  weibo: skin(social, "WeiboSkin"),
  twitter: skin(mymy, "MymyX"),
  threads: skin(() => import("./ThreadsReference"), "ThreadsReference"),
  facebook: skin(social, "FacebookSkin"),
  redbook: skin(social, "RedbookSkin"),
  pinterest: skin(social, "PinterestSkin"),
  reddit: skin(social, "RedditSkin"),
  forum: skin(social, "ForumSkin"),
  snapchat: skin(social, "SnapchatSkin"),
  spotify: skin(media, "SpotifySkin"),
  netease: skin(media, "NeteaseSkin"),
  youtube: skin(media, "YouTubeSkin"),
  bilibili: skin(media, "BilibiliSkin"),
  douyin: skin(media, "DouyinSkin"),
  tiktok: skin(media, "TikTokSkin"),
  netflix: skin(media, "NetflixSkin"),
  alipay: skin(commerce, "AlipaySkin"),
  taobao: skin(commerce, "TaobaoSkin"),
  delivery: skin(commerce, "DeliverySkin"),
};
