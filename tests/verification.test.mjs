import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoVerification,matchingReservations} from '../src/verification.mjs';
const person={name:'체험고객',phone:'010-0000-0000'};
function fixture(){let now=0,sequence=123456;return {auth:createDemoVerification({now:()=>now,generate:()=>String(sequence++)}),advance:ms=>now+=ms};}
test('booking history is hidden until matching name and phone are verified',()=>{
  const {auth}=fixture();assert.equal(auth.identity(),null);
  assert.equal(auth.request(person).code,'123456');
  assert.ok(auth.verify({...person,name:'다른고객'},'123456').error);
  assert.equal(auth.identity(),null);
  assert.ok(auth.verify(person,'123456').identity);
  assert.equal(auth.identity().phone,'01000000000');
  assert.ok(auth.verify(person,'123456').error);
});
test('codes expire after three minutes and sessions after ten minutes',()=>{
  const {auth,advance}=fixture();auth.request(person);advance(180000);
  assert.ok(auth.verify(person,'123456').error);assert.equal(auth.identity(),null);
  const challenge=auth.request(person);assert.ok(auth.verify(person,challenge.code).identity);
  advance(600000);assert.equal(auth.identity(),null);
});
test('resends have cooldown and invalidate the previous code',()=>{
  const {auth,advance}=fixture();auth.request(person);
  assert.ok(auth.request(person).error);advance(30000);
  const newCode=auth.request(person).code;assert.equal(newCode,'123457');
  assert.ok(auth.verify(person,'123456').error);assert.ok(auth.verify(person,newCode).identity);
  auth.logout();assert.equal(auth.identity(),null);
});
test('five failed attempts invalidate challenge and enforce a short delay',()=>{
  const {auth,advance}=fixture();auth.request(person);
  for(let i=0;i<5;i++)assert.ok(auth.verify(person,'000000').error);
  assert.ok(auth.verify(person,'123456').error);assert.ok(auth.request(person).error);
  advance(30000);assert.ok(auth.request(person).code);
});
test('invalid identity cannot request a code',()=>{
  const {auth}=fixture();assert.ok(auth.request({...person,phone:'123'}).errors.phone);
  assert.ok(auth.request({...person,name:'<script>'}).errors.name);
});
test('history filtering requires both fields and returns no data without identity',()=>{
  const records=[{id:'one',name:'체험고객',phone:'01000000000'},{id:'two',name:'다른고객',phone:'01000000000'},{id:'three',name:'체험고객',phone:'01011111111'}];
  assert.deepEqual(matchingReservations(records,null),[]);
  assert.deepEqual(matchingReservations(records,person).map(r=>r.id),['one']);
});
