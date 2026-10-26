import { home, about, serviceList, serviceDetail, notFound } from "./pages.mjs";
import {
  initialBooking,
  bookingPage,
  completePage,
} from "./booking-page.mjs";
import { createStore } from "./store.mjs";
import { availableSlots } from "./booking.mjs";
import { serviceById } from "./data.mjs";
import { createReservationAccess } from "./reservation-access.mjs";
const main = document.querySelector("main");
const store = createStore({
  getItem: (k) => window.localStorage.getItem(k),
  setItem: (k, v) => window.localStorage.setItem(k, v),
  removeItem: (k) => window.localStorage.removeItem(k),
});
let booking = initialBooking(),
  pendingCancel = null,
  recentBookingId = null,
  storageError = "",
  route = "";
const access = createReservationAccess({store, readRecords:records, refresh:renderReservations});
function renderReservations() {
  if (route === '/reservations') {
    main.innerHTML = access.view(records(), storageError);
    document.title = '건강니 치과';
  }
}
function records() {
  try {
    const list = store.list();
    storageError = "";
    return list;
  } catch {
    storageError =
      "예약 기록을 읽을 수 없습니다. 브라우저의 저장소 설정을 확인하거나 기록을 삭제한 뒤 다시 시도해 주세요.";
    return [];
  }
}
function bookingRender(focus) {
  main.innerHTML = bookingPage(booking, records());
  if (focus) main.querySelector(focus)?.focus({ preventScroll: true });
}
function navigate() {
  const [path, query = ""] = (location.hash.slice(1) || "/").split("?");
  route = path;
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  if (path === "/") main.innerHTML = home();
  else if (path === "/about") main.innerHTML = about();
  else if (path === "/services") main.innerHTML = serviceList();
  else if (path.startsWith("/services/"))
    main.innerHTML = serviceDetail(path.split("/")[2]);
  else if (path === "/booking") {
    const service = new URLSearchParams(query).get("service");
    if (serviceById(service)) booking.service = service;
    if (
      booking.time &&
      !availableSlots(booking.date, records()).includes(booking.time)
    )
      booking.time = "";
    bookingRender();
  } else if (path === "/reservations")
    renderReservations();
  else if (path.startsWith("/complete/")) {
    const id = path.split("/")[2];
    if (id !== recentBookingId && !access.owns(id)) {location.hash='/reservations'; return;}
    const r = records().find((r) => r.id === id);
    main.innerHTML =
      r && r.status === "confirmed" ? completePage(r) : notFound();
  } else main.innerHTML = notFound();
  const active = path.startsWith("/services")
    ? "services"
    : path === "/about"
      ? "about"
      : ["/booking", "/reservations"].includes(path) ||
          path.startsWith("/complete/")
        ? "booking"
        : "";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    if (a.dataset.nav === active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.title = '건강니 치과';
  window.scrollTo({ top: 0, behavior: "instant" });
  main.focus({ preventScroll: true });
}
function info(title, html) {
  document.querySelector("#info-title").textContent = title;
  document.querySelector("#info-content").innerHTML = html;
  document.querySelector("#info-dialog").showModal();
}
function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (node.hidden = true), 4000);
}
document.addEventListener("click", async (event) => {
  if (event.target.closest(".skip-link")) {
    event.preventDefault();
    main.focus({ preventScroll: false });
    return;
  }
  const button = event.target.closest("button");
  if (!button) return;
  if (access.click(button)) {recentBookingId=null; return;}
  if (button.hasAttribute("data-close")) {
    button.closest("dialog").close();
    return;
  }
  if (button.dataset.service) {
    booking.service = button.dataset.service;
    delete booking.errors.service;
    bookingRender(`[data-service="${booking.service}"]`);
    return;
  }
  if (button.dataset.date) {
    booking.date = button.dataset.date;
    booking.time = "";
    delete booking.errors.date;
    delete booking.errors.time;
    bookingRender(`[data-date="${booking.date}"]`);
    return;
  }
  if (button.dataset.time) {
    booking.time = button.dataset.time;
    delete booking.errors.time;
    bookingRender(`[data-time="${booking.time}"]`);
    return;
  }
  if (button.dataset.month) {
    const d = new Date(
      booking.year,
      booking.month + Number(button.dataset.month),
      1,
    );
    booking.month = d.getMonth();
    booking.year = d.getFullYear();
    bookingRender(".calendar-head h3");
    return;
  }
  if (button.dataset.cancel) {
    if (!access.owns(button.dataset.cancel)) {renderReservations(); return;}
    pendingCancel = button.dataset.cancel;
    info(
      "예약을 취소할까요?",
      '<p>취소하면 선택했던 시간을 다시 예약할 수 있습니다.</p><button class="button outline full" type="button" data-action="cancel-confirm">예약 취소하기</button>',
    );
    return;
  }
  const action = button.dataset.action;
  if (action === "consult")
    document.querySelector("#consult-dialog").showModal();
  if (action === "consult-book") {
    const service = document.querySelector("#quick-service").value;
    document.querySelector("#consult-dialog").close();
    const target = `/booking?service=${service}`;
    if (location.hash === "#" + target) {
      booking.service = service;
      bookingRender();
      main.focus();
    } else location.hash = target;
  }
  if (action === "privacy")
    info(
      "예약 정보 저장 안내",
      "<p>예약을 위해 입력한 이름, 휴대폰 번호, 진료 항목, 방문 일정은 이 기기에 저장됩니다.</p><p>외부 서버로 전송하지 않으며 광고나 분석 도구를 사용하지 않습니다. 예약자 확인 후 본인의 기록을 삭제할 수 있습니다.</p><p>다른 사람과 기기를 공유한다면 이용 후 예약 기록을 삭제해 주세요.</p>",
    );
  if (action === "cancel-confirm") {
    button.disabled = true;
    try {
      await access.cancel(pendingCancel);
      document.querySelector("#info-dialog").close();
      navigate();
      toast("예약을 취소했습니다.");
    } catch {
      document.querySelector("#info-content").textContent =
        "예약자 인증이 만료되었거나 저장소에 접근할 수 없습니다. 다시 인증한 뒤 시도해 주세요.";
    }
  }
  if (action === "clear-data")
    info(
        "내 예약 기록을 삭제할까요?",
      '<p>현재 인증한 이름과 연락처에 해당하는 예약 기록만 삭제합니다. 다른 예약자의 기록은 유지됩니다.</p><button class="button outline full" type="button" data-action="clear-confirm">내 예약 기록 삭제</button>',
    );
  if (action === "clear-confirm") {
    try {
      await access.clear();
      booking = initialBooking();
      document.querySelector("#info-dialog").close();
      navigate();
      toast("현재 예약자의 기록을 삭제했습니다.");
    } catch {
      document.querySelector("#info-content").textContent =
        "예약자 인증이 만료되었거나 저장소에 접근할 수 없어 삭제하지 못했습니다.";
    }
  }
});
document.addEventListener("input", (event) => {
  if (access.input(event.target)) return;
  if (event.target.dataset.field) {
    const k = event.target.dataset.field;
    booking[k] = k === "consent" ? event.target.checked : event.target.value;
  }
});
document.addEventListener("submit", async (event) => {
  if (event.target.id === 'lookup-form') {event.preventDefault(); access.submit(); return;}
  if (event.target.id !== "booking-form") return;
  event.preventDefault();
  if (booking.busy) return;
  booking.busy = true;
  booking.errors = {};
  bookingRender();
  try {
    const result = await store.book(booking);
    if (result.errors) {
      booking.errors = result.errors;
      booking.busy = false;
      bookingRender();
      const key = Object.keys(result.errors)[0];
      main.querySelector(`[data-field="${key}"], #error-${key}`)?.focus();
      main
        .querySelector(".field-error")
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    } else {
      booking = initialBooking();
      recentBookingId = result.record.id;
      location.hash = `/complete/${result.record.id}`;
    }
  } catch {
    booking.busy = false;
    booking.errors = {
      general:
        "예약을 저장하지 못했습니다. 브라우저의 저장소 설정을 확인한 뒤 다시 시도해 주세요.",
    };
    bookingRender();
    main.querySelector(".save-error")?.scrollIntoView({ block: "center" });
  }
});
window.addEventListener("hashchange", navigate);
window.addEventListener("storage", () => {
  if (route === "/reservations")
    renderReservations();
  if (route === "/booking") {
    if (!availableSlots(booking.date, records()).includes(booking.time))
      booking.time = "";
    bookingRender();
  }
});
for (const dialog of document.querySelectorAll("dialog"))
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
navigate();
