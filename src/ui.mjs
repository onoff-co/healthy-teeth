export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function icon(name, cls = "") {
  const paths = {
    tooth:
      '<path d="M24 10C11 1 4 12 8 24c2 6 3 18 8 18s3-14 8-14 3 14 8 14 6-12 8-18C44 12 37 1 24 10Z"/>',
    whitening:
      '<path d="M23 12C12 4 6 13 9 24c2 5 3 15 7 15s3-11 7-11 3 11 7 11 5-10 7-15c1-4 1-8-1-10"/><path d="m36 4 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/>',
    orthodontics:
      '<path d="M24 10C11 1 4 12 8 24c2 6 3 18 8 18s3-14 8-14 3 14 8 14 6-12 8-18C44 12 37 1 24 10Z"/><path d="M8 20h32M17 17v6m14-6v6"/>',
    implant:
      '<path d="M15 21c-8-9-5-16 2-16 3 0 5 3 7 3s4-3 7-3c7 0 10 7 2 16Z"/><path d="M18 24h12v5H18zm3 5v11l3 4 3-4V29m-7 5h8m-8 5h8"/>',
    general:
      '<path d="M22 10C11 2 5 12 9 24c2 6 3 16 7 16s3-13 6-13 3 13 7 13c3 0 4-5 5-10"/><circle cx="34" cy="18" r="8"/><path d="m40 24 5 5m-14-11h6m-3-3v6"/>',
    leaf: '<path d="M39 7C17 6 7 16 12 29c5 13 24 8 27-22Z"/><path d="M9 41 31 17m-13 9 1-9m7 1 8-1"/>',
    clock: '<circle cx="24" cy="24" r="17"/><path d="M24 13v12l8 5"/>',
    chat: '<path d="M40 23a16 16 0 0 1-16 16H13l-8 5V23a18 18 0 0 1 35 0Z"/><path d="M15 20h15m-15 8h10"/>',
    check: '<circle cx="24" cy="24" r="18"/><path d="m15 24 6 6 13-14"/>',
    location:
      '<path d="M38 20c0 11-14 24-14 24S10 31 10 20a14 14 0 0 1 28 0Z"/><circle cx="24" cy="20" r="5"/>',
  };
  return `<svg class="line-icon ${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.tooth}</svg>`;
}
export const button = (href, label, style = "primary") =>
  `<a class="button ${style}" href="${href}">${label}</a>`;
export const hours = () =>
  `<dl class="hours-list"><div><dt>평일</dt><dd>10:00 – 19:00</dd></div><div><dt>토요일</dt><dd>10:00 – 14:00</dd></div><div><dt>점심시간</dt><dd>13:00 – 14:00</dd></div><div><dt>일요일</dt><dd>휴진</dd></div></dl><small>토요일은 점심시간 없이 진료합니다.</small>`;
export const cta = () =>
  `<section class="care-cta"><div class="container cta-inner"><div><span class="eyebrow">YOUR SMILE STARTS HERE</span><h2>미뤄뒀던 치아 고민,<br>오늘은 편하게 이야기해요.</h2></div>${button("#/booking", "나에게 맞는 시간 예약하기")}</div></section>`;
