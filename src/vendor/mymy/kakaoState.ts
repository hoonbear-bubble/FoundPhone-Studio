import type { Item } from "../../schema";
export function displayedKakaoItems(
  items: Item[],
  step: number,
  deleted: string[],
) {
  const removed = new Set(deleted);
  return items.filter(
    (i) =>
      !removed.has(i.id) &&
      !i.meta.groupAvatar &&
      !i.meta.replyChoice &&
      (!i.meta.tapSequence || Number(i.meta.tapOrder) <= step),
  );
}
export function clearKakaoThread(
  items: Item[],
  thread: string,
  deleted: string[],
) {
  return [
    ...new Set([
      ...deleted,
      ...items.filter((i) => i.title === thread).map((i) => i.id),
    ]),
  ];
}
