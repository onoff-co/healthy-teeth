import {createDemoVerification,matchingReservations} from './verification.mjs';
import {reservationsPage} from './booking-page.mjs';
import {escapeHTML as e,icon} from './ui.mjs';
export function createReservationAccess({store,readRecords,refresh}){
  const verification=createDemoVerification();
  let state={name:'',phone:'',code:'',challenge:null,errors:{},resendAt:0};
  let timer=null,expiryTimer=null;
  const error=key=>state.errors[key]?`<p id="lookup-error-${key}" class="field-error" role="alert" tabindex="-1">${e(state.errors[key])}</p>`:'';
  const errorAttrs=key=>state.errors[key]?`aria-invalid="true" aria-describedby="lookup-error-${key}"`:'';
  function view(records,storageError){
    const identity=verification.identity();
    if(identity)return reservationsPage(matchingReservations(records,identity),storageError,identity);
    const wait=Math.max(0,Math.ceil((state.resendAt-Date.now())/1000));
    return `<section class="container lookup-layout"><div class="lookup-intro"><span class="eyebrow">A SIMPLE CHECK, YOUR VISIT</span><h1>내 예약을<br> <span>확인해요.</span></h1><p>복잡한 회원가입 없이,<br>예약할 때 입력한 이름과 휴대폰 번호로<br>방문 일정을 확인하세요.</p><div class="lookup-illustration" aria-hidden="true">${icon('tooth')}<span>JUST A LITTLE CHECK.</span></div></div><div class="lookup-panel"><div class="lookup-panel-head">${icon('check')}<div><h2>예약자 확인</h2><p>이름과 연락처 확인 후 인증해 주세요.</p></div></div><form id="lookup-form" novalidate><div class="field"><label for="lookup-name">예약자 이름</label><input id="lookup-name" data-lookup="name" maxlength="30" autocomplete="off" value="${e(state.name)}" placeholder="예약 시 입력한 이름" ${state.challenge?'readonly':''} ${errorAttrs('name')}>${error('name')}</div><div class="field"><label for="lookup-phone">휴대폰 번호</label><input id="lookup-phone" data-lookup="phone" type="tel" inputmode="tel" maxlength="13" autocomplete="off" value="${e(state.phone)}" placeholder="예: 010-0000-0000" ${state.challenge?'readonly':''} ${errorAttrs('phone')}>${error('phone')}</div><button type="button" class="button ${state.challenge?'outline':'primary'} full" data-action="lookup-request" ${wait?'disabled':''}>${wait?`${wait}초 후 재발급 가능`:state.challenge?'인증번호 다시 받기':'인증번호 받기'}</button>${state.challenge?`<div class="demo-code-box" role="status"><span>인증번호</span><strong id="demo-verification-code">${e(state.challenge.code)}</strong><small>아래 입력란에 이 번호를 입력해 주세요.</small></div><div class="field"><label for="lookup-code">인증번호 <span id="verification-timer"></span></label><input id="lookup-code" data-lookup="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${e(state.code)}" placeholder="6자리 인증번호" ${errorAttrs('code')}>${error('code')}</div><button class="button primary full" type="submit">인증하고 내 예약 보기</button><button class="text-link lookup-reset" type="button" data-action="lookup-reset">이름·휴대폰 번호 다시 입력</button>`:''}${error('general')}</form><p class="lookup-note">인증 상태는 10분 동안 유지됩니다.<br>새로고침하거나 조회를 종료하면 다시 인증합니다.</p></div></section>`;
  }
  function tick(){
    const request=document.querySelector('[data-action="lookup-request"]');
    if(request){const wait=Math.max(0,Math.ceil((state.resendAt-Date.now())/1000));request.disabled=wait>0;request.textContent=wait?`${wait}초 후 재발급 가능`:state.challenge?'인증번호 다시 받기':'인증번호 받기';}
    const remaining=document.querySelector('#verification-timer');
    if(remaining&&state.challenge){const seconds=Math.max(0,Math.ceil((state.challenge.expiresAt-Date.now())/1000));remaining.textContent=seconds?`남은 시간 ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'만료됨 · 새 번호를 받아 주세요';}
    if(!state.challenge&&Date.now()>=state.resendAt)clearInterval(timer);
  }
  function renderAndFocus(selector){refresh();tick();if(selector)document.querySelector(selector)?.focus({preventScroll:true});}
  function reset(){verification.logout();state={...state,code:'',challenge:null,errors:{}};clearTimeout(expiryTimer);clearInterval(timer);if(Date.now()<state.resendAt)timer=setInterval(tick,1000);renderAndFocus('#lookup-name');}
  return {
    view,
    input(target){if(!target.dataset.lookup)return false;state[target.dataset.lookup]=target.value;return true;},
    click(button){
      const action=button.dataset.action;
      if(action==='lookup-logout'||action==='lookup-reset'){reset();return true;}
      if(action!=='lookup-request')return false;
      const result=verification.request(state);state.errors={};
      if(result.errors)state.errors=result.errors;
      else if(result.error)state.errors.general=result.error;
      else{state.challenge=result;state.code='';state.resendAt=Date.now()+30000;clearInterval(timer);timer=setInterval(tick,1000);}
      renderAndFocus(result.code?'#lookup-code':`#lookup-error-${Object.keys(state.errors)[0]}`);return true;
    },
    submit(){
      if(!state.challenge){state.errors={general:'인증번호를 먼저 받아 주세요.'};renderAndFocus('#lookup-error-general');return;}
      state.errors={};const result=verification.verify(state,state.code);
      if(result.error){
        if(result.reset){state.challenge=null;state.code='';state.errors.general=result.error;if(result.retryAfter)state.resendAt=Date.now()+result.retryAfter;renderAndFocus('#lookup-error-general');}
        else{state.errors.code=result.error;renderAndFocus('#lookup-code');}
        return;
      }
      clearInterval(timer);state={...state,code:'',challenge:null};
      clearTimeout(expiryTimer);expiryTimer=setTimeout(()=>{verification.logout();refresh();},600000);
      renderAndFocus('#main');
    },
    owns(id){return matchingReservations(readRecords(),verification.identity()).some(r=>r.id===id);},
    async cancel(id){const identity=verification.identity();if(!identity)throw new Error('verification required');return store.cancel(id,identity);},
    async clear(){const identity=verification.identity();if(!identity)throw new Error('verification required');return store.clearFor(identity);},
    logout:reset
  };
}
