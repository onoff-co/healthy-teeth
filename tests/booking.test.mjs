import test from 'node:test';
import assert from 'node:assert/strict';
import { availableSlots, validateBooking, reserve, cancelReservation, dateKey } from '../src/booking.mjs';
const now = new Date(2026, 9, 26, 9, 0);
const valid = { service: 'whitening', date: '2026-10-27', time: '10:00', name: '체험고객', phone: '01000000000', consent: true };
test('closed, past, invalid and too distant dates cannot be reserved', () => {
  for(const date of ['2026-11-01','2026-10-25','2027-01-01','2026-02-30']) assert.deepEqual(availableSlots(date, [], now), []);
});
test('Saturday ends at 13:30, lunch and elapsed times excluded', () => {
  assert.equal(availableSlots('2026-10-31', [], now).at(-1), '13:30');
  assert.ok(!availableSlots('2026-10-27', [], now).includes('13:00'));
  assert.ok(!availableSlots('2026-10-26', [], new Date(2026,9,26,10)).includes('10:00'));
});
test('validation rejects missing consent and malformed contact', () => {
  assert.equal(Object.keys(validateBooking(valid, [], now)).length, 0);
  const errors=validateBooking({...valid, phone:'123',consent:false},[],now);
  assert.ok(errors.phone); assert.ok(errors.consent);
  assert.ok(validateBooking({...valid,service:'fake'},[],now).service);
  assert.ok(validateBooking({...valid,name:'<script>'},[],now).name);
});
test('occupied slots reject duplicates and cancellation releases them', () => {
  const first=reserve(valid,[],now,'one');
  assert.equal(first.record.status,'confirmed');
  assert.ok(reserve(valid,[first.record],now,'two').errors.time);
  const cancelled=cancelReservation([first.record],'one');
  assert.equal(cancelled[0].status,'cancelled');
  assert.ok(reserve(valid,cancelled,now,'two').record);
});
test('records allowlist fields and normalize phone',()=>{
  const result=reserve({...valid,phone:'010-0000-0000',secret:'discard'},[],now,'one');
  assert.equal(result.record.phone,'01000000000'); assert.equal(result.record.secret,undefined);
  assert.equal(dateKey(now),'2026-10-26');
});
