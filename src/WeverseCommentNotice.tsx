import { BadgeCheck } from "lucide-react";
import { safeMedia, type Item } from "./schema";
export function WeverseCommentNotice({
  comment,
  post,
  date,
  time,
}: {
  comment: Item;
  post: Item;
  date: string;
  time: string;
}) {
  const avatar = safeMedia(comment.avatar);
  return (
    <span className="wvs-comment-notice">
      {avatar ? (
        <img
          className="wvs-notice-avatar"
          src={avatar}
          alt={comment.sender + "的头像"}
        />
      ) : (
        <span className="wvs-notice-avatar">{comment.sender.slice(0, 1)}</span>
      )}
      <span className="wvs-notice-copy">
        <span className="wvs-notice-text">
          💬 <b>{comment.sender}</b>
          <BadgeCheck
            className="wvs-notice-verified"
            aria-label="艺人认证"
            size={14}
          />
          在 {post.sender} 的帖子下发表了评论：{comment.body}
        </span>
        <small>
          TWS · {date.replaceAll("-", ". ")}. {time}
        </small>
      </span>
    </span>
  );
}
