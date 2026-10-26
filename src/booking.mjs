import { serviceById } from "./data.mjs";
export const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [y, m, d] = value.split("-").map(Number),
    result = new Date(y, m - 1, d);
  return dateKey(result) === value ? result : null;
}
export function availableSlots(date, records = [], now = new Date()) {
  const day = parseDate(date);
  if (!day) return [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(today);
  last.setDate(last.getDate() + 60);
  if (day < today || day > last || day.getDay() === 0) return [];
  const slots = [];
  for (
    let minutes = 600;
    minutes < (day.getDay() === 6 ? 840 : 1140);
    minutes += 30
  ) {
    if (day.getDay() !== 6 && minutes >= 780 && minutes < 840) continue;
    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    const stamp = new Date(day);
    stamp.setHours(Math.floor(minutes / 60), minutes % 60);
    if (
      stamp > now &&
      !records.some(
        (r) => r.status === "confirmed" && r.date === date && r.time === time,
      )
    )
      slots.push(time);
  }
  return slots;
}
export function validateBooking(input, records = [], now = new Date()) {
  const errors = {};
  if (!serviceById(input.service))
    errors.service = "진료 항목을 선택해 주세요.";
  if (!parseDate(input.date) || !availableSlots(input.date, [], now).length)
    errors.date = "예약 가능한 날짜를 선택해 주세요.";
  if (
    !input.time ||
    !availableSlots(input.date, records, now).includes(input.time)
  )
    errors.time = "예약 가능한 시간을 다시 선택해 주세요.";
  if (!/^[가-힣a-zA-Z\s]{2,30}$/.test((input.name || "").trim()))
    errors.name = "이름은 한글 또는 영문 2~30자로 입력해 주세요.";
  if (!/^010\d{8}$/.test((input.phone || "").replace(/[\s-]/g, "")))
    errors.phone = "010으로 시작하는 휴대폰 번호 11자리를 입력해 주세요.";
  if (input.consent !== true)
    errors.consent = "예약 정보 저장 안내에 동의해 주세요.";
  return errors;
}
export function reserve(
  input,
  records = [],
  now = new Date(),
  id = globalThis.crypto.randomUUID(),
) {
  const errors = validateBooking(input, records, now);
  if (Object.keys(errors).length) return { errors };
  return {
    record: {
      id,
      service: input.service,
      date: input.date,
      time: input.time,
      name: input.name.trim(),
      phone: input.phone.replace(/[\s-]/g, ""),
      status: "confirmed",
      createdAt: now.toISOString(),
    },
  };
}
export const cancelReservation = (records, id) =>
  records.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r));
