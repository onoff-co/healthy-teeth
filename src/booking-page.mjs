import { services, serviceById } from "./data.mjs";
import { dateKey, availableSlots, parseDate } from "./booking.mjs";
import { escapeHTML as e, icon, button, hours } from "./ui.mjs";
export function initialBooking() {
  const now = new Date();
  return {
    service: "general",
    date: "",
    time: "",
    name: "",
    phone: "",
    consent: false,
    month: now.getMonth(),
    year: now.getFullYear(),
    errors: {},
    busy: false,
  };
}
export const readableDate = (value) => {
  const d = parseDate(value);
  return d
    ? `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]})`
    : "";
};
const error = (s, key) =>
  s.errors[key]
    ? `<p class="field-error" id="error-${key}" role="alert" tabindex="-1">${e(s.errors[key])}</p>`
    : "";
const attrs = (s, key) =>
  s.errors[key] ? `aria-invalid="true" aria-describedby="error-${key}"` : "";
function calendar(s, records) {
  const now = new Date(),
    start = new Date(s.year, s.month, 1),
    end = new Date(s.year, s.month + 1, 0);
  const limit = new Date(now);
  limit.setDate(limit.getDate() + 60);
  const prior = s.year === now.getFullYear() && s.month === now.getMonth();
  const next = new Date(s.year, s.month + 1, 1) > limit;
  let cells = Array.from(
    { length: start.getDay() },
    () => '<span class="calendar-empty"></span>',
  ).join("");
  for (let d = 1; d <= end.getDate(); d++) {
    const date = new Date(s.year, s.month, d),
      key = dateKey(date),
      enabled = availableSlots(key, records, now).length > 0;
    cells += `<button type="button" class="calendar-day ${s.date === key ? "selected" : ""} ${key === dateKey(now) ? "today" : ""}" data-date="${key}" aria-label="${s.year}년 ${s.month + 1}월 ${d}일${enabled ? "" : " 예약 불가"}" aria-pressed="${s.date === key}" ${enabled ? "" : "disabled"}>${d}</button>`;
  }
  return `<div class="calendar"><div class="calendar-head"><button type="button" data-month="-1" ${prior ? "disabled" : ""}>이전 달</button><h3 tabindex="-1" aria-live="polite">${s.year}년 ${s.month + 1}월</h3><button type="button" data-month="1" ${next ? "disabled" : ""}>다음 달</button></div><div class="calendar-week" aria-hidden="true">${["일", "월", "화", "수", "목", "금", "토"].map((d) => `<span>${d}</span>`).join("")}</div><div class="calendar-grid">${cells}</div></div>`;
}
export function bookingPage(s, records) {
  const slots = s.date ? availableSlots(s.date, records) : [];
  return `<section class="page-intro compact container"><span class="eyebrow">A TIME FOR YOUR SMILE</span><h1>편안한 진료의 시작,<br><span>당신의 시간을 예약하세요.</span></h1><p>원하는 진료와 방문 시간을 선택해 주세요.</p></section><div class="container booking-layout"><form id="booking-form" novalidate><fieldset ${s.busy ? "disabled" : ""}><legend class="sr-only">진료 및 방문 정보</legend><section class="form-section"><h2>어떤 진료가 필요하세요?</h2><div class="service-choices" role="group" aria-label="진료 항목">${services.map((x) => `<button type="button" data-service="${x.id}" aria-pressed="${s.service === x.id}" class="service-choice ${s.service === x.id ? "selected" : ""}">${icon(x.id)}${x.name}</button>`).join("")}</div>${error(s, "service")}</section><section class="form-section"><h2>언제 방문하시겠어요?</h2><p class="muted small">오늘부터 60일 이내 예약할 수 있습니다. 일요일은 휴진입니다.</p>${calendar(s, records)}${error(s, "date")}<div class="time-heading"><h3>방문 시간</h3><span class="small muted">${s.date ? e(readableDate(s.date)) : "날짜를 먼저 선택해 주세요."}</span></div><div class="time-slots" role="group" aria-label="예약 시간">${s.date ? (slots.length ? slots.map((time) => `<button type="button" data-time="${time}" aria-pressed="${s.time === time}" class="time-slot ${s.time === time ? "selected" : ""}">${time}</button>`).join("") : '<p class="small muted">선택한 날짜에 예약 가능한 시간이 없습니다. 다른 날짜를 선택해 주세요.</p>') : '<p class="time-empty">달력에서 원하는 날짜를 선택하면<br>예약 가능한 시간이 표시됩니다.</p>'}</div>${error(s, "time")}</section><section class="form-section"><h2>예약자 정보를 알려주세요.</h2><p class="muted small">예약 확인에 사용할 이름과 휴대폰 번호를 입력해 주세요.</p><div class="fields-row"><div class="field"><label for="name">예약자 이름 <span>필수</span></label><input id="name" name="name" data-field="name" maxlength="30" autocomplete="off" value="${e(s.name)}" placeholder="예: 김건강" ${attrs(s, "name")}>${error(s, "name")}</div><div class="field"><label for="phone">휴대폰 번호 <span>필수</span></label><input id="phone" name="phone" data-field="phone" type="tel" inputmode="tel" maxlength="13" autocomplete="off" value="${e(s.phone)}" placeholder="예: 010-0000-0000" ${attrs(s, "phone")}>${error(s, "phone")}</div></div><label class="consent"><input type="checkbox" name="consent" data-field="consent" ${s.consent ? "checked" : ""} ${attrs(s, "consent")}><span><strong>예약 정보 저장에 동의합니다.</strong><small>이름·연락처·방문 일정이 이 기기에 저장됩니다. 예약자 확인 후 본인의 기록을 삭제할 수 있습니다.</small></span></label>${error(s, "consent")}</section>${s.errors.general ? `<div class="save-error" role="alert" tabindex="-1">${e(s.errors.general)}</div>` : ""}<button class="button primary full submit-booking" type="submit">${s.busy ? "예약을 저장하고 있어요…" : "선택한 일정으로 예약하기"}</button></fieldset></form><aside class="booking-aside"><div class="booking-summary"><span class="eyebrow">YOUR VISIT</span><h2>방문 일정</h2><dl><div><dt>진료</dt><dd>${serviceById(s.service)?.name || "선택 전"}</dd></div><div><dt>날짜</dt><dd>${s.date ? e(readableDate(s.date)) : "날짜를 선택해 주세요"}</dd></div><div><dt>시간</dt><dd>${s.time ? e(s.time) : "시간을 선택해 주세요"}</dd></div></dl><p>선택한 일정은 접수 버튼을 눌러야 저장됩니다.</p><a href="#/reservations" class="text-link">내 예약 확인하기</a></div><div class="aside-hours"><h3>방문 전 확인해 주세요.</h3>${hours()}<p>어떤 진료를 선택할지 고민이라면<br>일반 진료로 예약해 주세요.</p></div></aside></div>`;
}
export function reservationsPage(records, storageError = "", identity = null) {
  const verifiedPanel = identity ? `<div class="verified-panel"><div>${icon('check')}<p><strong>${e(identity.name)}님</strong><span>${e(identity.phone.slice(0,3))}-****-${e(identity.phone.slice(-4))} · 예약자 확인 완료</span></p></div><button class="button outline" type="button" data-action="lookup-logout">조회 종료</button></div>` : '';
  return `<section class="page-intro compact container"><span class="eyebrow">YOUR APPOINTMENTS</span><h1>내 예약 확인</h1><p>예약하신 진료와 방문 일정을 확인해 주세요.</p></section><section class="container reservation-area">${verifiedPanel}${storageError ? `<div class="save-error" role="alert" tabindex="-1">${e(storageError)}</div>` : ""}${
    records.length
      ? `<div class="reservation-list">${[...records]
          .reverse()
          .map(
            (r) =>
              `<article class="reservation-card"><div class="reservation-status ${r.status === "cancelled" ? "cancelled" : ""}">${r.status === "confirmed" ? "접수 완료" : "취소 완료"}</div><div><span class="eyebrow">${e(r.id.slice(0, 8).toUpperCase())}</span><h2>${serviceById(r.service).name}</h2><p>${e(readableDate(r.date))} · ${e(r.time)}</p><p class="muted small">${e(r.name)} · ${e(r.phone.slice(0, 3))}-****-${e(r.phone.slice(-4))}</p></div>${r.status === "confirmed" ? `<button type="button" class="button outline" data-cancel="${e(r.id)}">예약 취소</button>` : '<span class="muted small">취소된 일정입니다.</span>'}</article>`,
          )
          .join("")}</div>`
      : `<div class="empty-state">${icon("clock")}<h2>아직 접수된 예약이 없어요.</h2><p>편한 날짜와 시간을 골라 첫 예약을 진행해 보세요.</p>${button("#/booking", "예약하러 가기")}</div>`
  }<div class="reservation-tools">${button("#/booking", "새 예약하기", "outline")}<button type="button" class="text-link" data-action="clear-data">내 예약 기록 삭제</button></div></section>`;
}
export function completePage(r) {
  return `<section class="container completion"><div class="completion-mark">${icon("check")}</div><span class="eyebrow">SEE YOU WITH A SMILE</span><h1>예약이 완료되었어요.</h1><p>${e(r.name)}님, 선택하신 방문 일정을 확인해 주세요.</p><div class="completion-detail"><span class="pill">접수 완료</span><h2>${serviceById(r.service).name}</h2><p>${e(readableDate(r.date))} · ${e(r.time)}</p><small>접수번호 ${e(r.id.slice(0, 8).toUpperCase())}</small></div><p class="demo-reminder">예약 변경이나 취소는 내 예약 확인에서 진행할 수 있어요.</p><div class="button-row">${button("#/reservations", "내 예약 확인")}${button("#/", "홈으로 가기", "outline")}</div></section>`;
}
