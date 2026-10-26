// A UI-only verification simulation. The visible code is deliberately not SMS authentication.
export const normalizeIdentity=input=>({name:String(input?.name||'').trim().replace(/\s+/g,' '),phone:String(input?.phone||'').replace(/[\s-]/g,'')});
export function identityErrors(input){
  const person=normalizeIdentity(input),errors={};
  if(!/^[가-힣a-zA-Z\s]{2,30}$/.test(person.name))errors.name='예약할 때 입력한 이름을 확인해 주세요.';
  if(!/^010\d{8}$/.test(person.phone))errors.phone='010으로 시작하는 휴대폰 번호 11자리를 입력해 주세요.';
  return errors;
}
export function matchingReservations(records,identity){
  if(!identity||Object.keys(identityErrors(identity)).length)return [];
  const person=normalizeIdentity(identity);
  return records.filter(r=>{const owner=normalizeIdentity(r);return owner.name===person.name&&owner.phone===person.phone;});
}
export function createDemoVerification({now=()=>Date.now(),generate=()=>String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0')}={}){
  let challenge=null,session=null,lastRequest=-Infinity,blockedUntil=0;
  return {
    request(input){
      const errors=identityErrors(input);if(Object.keys(errors).length)return {errors};
      const wait=Math.max(blockedUntil,lastRequest+30000)-now();
      if(wait>0)return {error:`${Math.ceil(wait/1000)}초 후 인증번호를 다시 받을 수 있습니다.`};
      session=null;lastRequest=now();challenge={...normalizeIdentity(input),code:generate(),expiresAt:now()+180000,attempts:0};
      return {code:challenge.code,expiresAt:challenge.expiresAt};
    },
    verify(input,code){
      if(!challenge)return {error:'인증번호를 먼저 받아 주세요.',reset:true};
      if(now()>=challenge.expiresAt){challenge=null;return {error:'인증번호가 만료되었습니다. 새 번호를 받아 주세요.',reset:true};}
      const person=normalizeIdentity(input);
      if(person.name!==challenge.name||person.phone!==challenge.phone||String(code)!==challenge.code){
        challenge.attempts++;
        if(challenge.attempts>=5){challenge=null;blockedUntil=now()+30000;return {error:'인증을 5회 실패했습니다. 30초 후 새 번호를 받아 주세요.',reset:true,retryAfter:30000};}
        return {error:`인증번호를 확인해 주세요. 남은 시도 ${5-challenge.attempts}회`};
      }
      session={...person,expiresAt:now()+600000};challenge=null;return {identity:{...session}};
    },
    identity(){if(session&&now()>=session.expiresAt)session=null;return session?{...session}:null;},
    logout(){session=null;challenge=null;}
  };
}
