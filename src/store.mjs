import { parseDate, reserve, cancelReservation } from "./booking.mjs";
import { serviceById } from "./data.mjs";
import { matchingReservations, identityErrors } from "./verification.mjs";
const key = "healthy-teeth-demo-reservations-v1";
function read(storage) {
  const raw = JSON.parse(storage.getItem(key) || "[]");
  if (!Array.isArray(raw))
    throw new Error("예약 저장 내용을 읽을 수 없습니다.");
  return raw.filter(
    (r) =>
      r &&
      typeof r.id === "string" &&
      serviceById(r.service) &&
      parseDate(r.date) &&
      /^\d{2}:\d{2}$/.test(r.time) &&
      ["confirmed", "cancelled"].includes(r.status) &&
      typeof r.name === "string" &&
      typeof r.phone === "string",
  );
}
export function createStore(storage) {
  return {
    list: () => read(storage),
    async book(input) {
      const action = () => {
        const records = read(storage),
          result = reserve(input, records);
        if (result.errors) return result;
        storage.setItem(key, JSON.stringify([...records, result.record]));
        return result;
      };
      if (globalThis.navigator?.locks)
        return navigator.locks.request(key, async () => action());
      return action();
    },
    async cancel(id, identity) {
      const action = () => {
        const current = read(storage);
        if (!matchingReservations(current, identity).some(r => r.id === id))
          throw new Error('현재 예약자의 기록만 취소할 수 있습니다.');
        const records = cancelReservation(current, id);
        storage.setItem(key, JSON.stringify(records));
        return records;
      };
      if (globalThis.navigator?.locks)
        return navigator.locks.request(key, async () => action());
      return action();
    },
    async clearFor(identity) {
      if (!identity || Object.keys(identityErrors(identity)).length)
        throw new Error('예약자 확인이 필요합니다.');
      const action = () => {
        const current = read(storage);
        const ids = new Set(matchingReservations(current, identity).map(r => r.id));
        const remaining = current.filter(r => !ids.has(r.id));
        if (remaining.length) storage.setItem(key, JSON.stringify(remaining));
        else storage.removeItem(key);
      };
      if (globalThis.navigator?.locks) return navigator.locks.request(key, async () => action());
      return action();
    },
  };
}
