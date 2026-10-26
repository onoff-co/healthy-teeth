import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../src/store.mjs';
import {dateKey} from '../src/booking.mjs';
function memory(){let saved=null;return {getItem:()=>saved,setItem:(k,v)=>saved=v,removeItem:()=>saved=null};}
function input(){const day=new Date();day.setDate(day.getDate()+1);while(day.getDay()===0)day.setDate(day.getDate()+1);return {service:'general',date:dateKey(day),time:'10:00',name:'체험고객',phone:'01000000000',consent:true};}
test('storage survives recreation and cancellation releases appointment',async()=>{
  const storage=memory(),first=createStore(storage),saved=await first.book(input());
  assert.ok(saved.record);const second=createStore(storage);
  assert.equal(second.list().length,1);
  assert.ok((await second.book(input())).errors.time);
  await second.cancel(saved.record.id,input());assert.equal(second.list()[0].status,'cancelled');
  assert.ok((await second.book(input())).record);
  await second.clearFor(input());assert.deepEqual(first.list(),[]);
});
test('write errors do not return a successful booking',async()=>{
  const storage={getItem:()=>null,setItem:()=>{throw new Error('quota');}};
  await assert.rejects(()=>createStore(storage).book(input()),/quota/);
});
test('corrupt storage surfaces an error rather than overwriting records',()=>{
  assert.throws(()=>createStore({getItem:()=>'{broken'}).list());
  assert.throws(()=>createStore({getItem:()=>'{}'}).list());
});
test('unrecognized stored entries are not rendered',()=>{
  const store=createStore({getItem:()=>JSON.stringify([{id:'bad',service:'unknown'}])});
  assert.deepEqual(store.list(),[]);
});
test('cancellation and deletion cannot affect another identity',async()=>{
  const store=createStore(memory()),owner=input(),first=await store.book(owner);
  const other={...owner,name:'다른고객',phone:'01011111111',time:'11:00'};
  await store.book(other);
  await assert.rejects(()=>store.cancel(first.record.id,other));
  await assert.rejects(()=>store.cancel(first.record.id,null));
  await assert.rejects(()=>store.clearFor(null));
  await store.clearFor(owner);
  assert.equal(store.list().length,1);assert.equal(store.list()[0].name,'다른고객');
});
