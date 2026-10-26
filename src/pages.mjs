import { services, serviceById } from "./data.mjs";
import { icon, button, hours, cta } from "./ui.mjs";
const serviceLink = (s) =>
  `<a class="treatment-link ${s.color}" href="#/services/${s.id}"><div class="treatment-icon">${icon(s.id)}</div><span class="eyebrow">${s.en}</span><h3>${s.name}</h3><p>${s.summary}</p><span class="text-link">진료 자세히 보기</span></a>`;
export function home() {
  return `
  <section class="home-hero container"><div class="hero-copy"><span class="eyebrow"><i></i> A LITTLE CARE, A BETTER SMILE</span><h1>편안하게,<br>건강하게.<span>당신답게 웃다.</span></h1><p>낯선 치과가 익숙한 편안함이 되도록.<br>건강니는 당신의 이야기를 먼저 듣습니다.</p><div class="hero-actions">${button("#/booking", "편안한 진료 예약")}${button("#/about", "건강니 알아보기", "text")}</div><div class="hero-signature"><span class="signature-line"></span><span>좋은 하루의 시작, 건강한 미소.</span></div></div><div class="hero-photo"><img src="./assets/hero.webp" alt="큰 창과 하늘색 진료 의자가 있는 밝고 따뜻한 치과 진료실" width="1536" height="1024" fetchpriority="high"><div class="photo-note">A SPACE TO FEEL AT EASE<span>머무는 순간까지 편안하게</span></div><div class="hero-stamp">care<br><span>for your</span><br>smile.</div></div></section>
  <section class="promise-strip"><div class="container promise-inner"><div>${icon("chat")}<span>충분히 듣는 상담</span></div><div>${icon("tooth")}<span>나에게 맞는 진료</span></div><div>${icon("leaf")}<span>편안하게 머무는 공간</span></div><p>작은 배려가 모여,<br><strong>더 나은 진료가 됩니다.</strong></p></div></section>
  <section class="section container"><div class="section-heading"><div><span class="eyebrow">OUR DENTAL CARE</span><h2>당신의 미소에 필요한 진료</h2></div><a class="text-link" href="#/services">전체 진료 살펴보기</a></div><div class="treatment-grid">${services.map(serviceLink).join("")}</div></section>
  <section class="philosophy"><div class="container philosophy-inner"><span class="eyebrow">THE WAY WE CARE</span><h2>치아만 보는 진료를 넘어,<br><span>당신의 일상을 생각합니다.</span></h2><div><p>치과에 오는 발걸음에는 저마다의 고민이 담겨 있습니다.<br>어디가 불편한지, 무엇이 걱정되는지.<br>작은 이야기부터 차근차근 함께하겠습니다.</p>${button("#/about", "건강니의 진료 철학", "outline")}</div><span class="philosophy-art" aria-hidden="true">${icon("leaf")}</span></div></section>
  <section class="section container"><div class="event-banner"><img src="./assets/event.webp" alt="연두색과 하늘색 오브제 옆에 놓인 하얀 치아 조형물" width="1774" height="887" loading="lazy"><div class="event-copy"><span class="pill">SMILE CARE WEEK</span><h2>미소를 위한<br>작은 시작.</h2><p>미백부터 교정까지, 궁금했던 치아 고민.<br>나에게 맞는 상담 시간을 찾아보세요.</p>${button("#/booking?service=whitening", "미소 상담 예약하기")}</div></div></section>
  <section class="visit-section container"><div><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>바쁜 일상에도,<br>편하게 들러요.</h2><p>건강한 미소를 위한 시간을<br>당신의 일정에 맞춰 준비하세요.</p>${button("#/booking", "예약 시간 확인하기", "outline")}</div><div class="visit-hours"><h3>${icon("clock")} 진료시간</h3>${hours()}</div><div class="visit-location"><h3>${icon("location")} 찾아오시는 길</h3><p>서울특별시 마포구 미소로 24<br>그린빌딩 3층</p><span class="location-label">미소역 2번 출구에서 도보 3분</span><a href="#/about" class="text-link">공간과 위치 알아보기</a></div></section>
`;
}
export function about() {
  return `
  <section class="page-title container"><h1>치과 소개</h1></section>
  <figure class="about-image container"><img src="./assets/about.webp" alt="연두색 리셉션과 하늘색 소파, 넓은 창을 갖춘 건강니의 대기 공간" width="1536" height="1024"><figcaption>WELCOME TO YOUR COMFORT ZONE<span>자연의 색과 온기를 담은 공간</span></figcaption></figure>
  <section class="section container about-values"><div><span class="eyebrow">OUR PROMISE</span><h2>믿음은 작은 배려에서<br>시작된다고 믿습니다.</h2></div><div class="value-list"><article><h3>이야기를 먼저 듣겠습니다.</h3><p>불편한 점과 걱정되는 마음을 충분히 나눌 수 있는 상담 시간을 준비합니다.</p></article><article><h3>이해할 수 있게 설명하겠습니다.</h3><p>현재 치아 상태와 가능한 진료 방향을 알기 쉬운 말로 설명합니다.</p></article><article><h3>일상을 함께 생각하겠습니다.</h3><p>치료를 시작하는 순간부터 관리하는 시간까지, 생활에 맞는 계획을 함께 고민합니다.</p></article></div></section>
  <section class="soft-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">SPACE & COMFORT</span><h2>편안함을 만드는 공간</h2></div><p>낯선 긴장감을 덜어주는<br>건강니의 작은 배려.</p></div><div class="space-grid"><article>${icon("leaf")}<h3>빛이 머무는 대기실</h3><p>부드러운 색감과 자연광이 어우러져 잠시 쉬어갈 수 있는 공간.</p></article><article>${icon("chat")}<h3>이야기에 집중하는 상담실</h3><p>주변의 방해를 줄이고 내 이야기를 편안히 나눌 수 있는 공간.</p></article><article>${icon("tooth")}<h3>차분하게 준비된 진료실</h3><p>꼭 필요한 장비를 정돈하고 진료의 흐름을 생각한 공간.</p></article></div></div></section>
  <section class="section container location-section"><div class="map-art" role="img" aria-label="위치 안내도: 미소역 인근 그린빌딩 3층."><span class="map-park">미소공원</span><div class="map-road road-a"></div><div class="map-road road-b"></div><div class="map-marker">${icon("location")}<strong>건강니 치과</strong><small>그린빌딩 3층</small></div><span class="map-station">미소역</span><span class="map-disclaimer">위치 안내도</span></div><div><span class="eyebrow">FIND US</span><h2>미소가 쉬어가는 자리</h2><p>서울특별시 마포구 미소로 24<br>그린빌딩 3층</p><p>미소역 2번 출구에서 도보 3분<br>건물 내 주차 공간 이용 가능</p>${hours()}</div></section>${cta()}
`;
}
export function serviceList() {
  return `
  <section class="page-title container"><h1>진료 안내</h1></section>
  <section class="container service-overview">${services.map((s) => `<a class="service-row ${s.color}" href="#/services/${s.id}"><div class="treatment-icon">${icon(s.id)}</div><div><span class="eyebrow">${s.en}</span><h2>${s.name}</h2></div><p>${s.summary}</p><span class="text-link">자세히 보기</span></a>`).join("")}</section>
  <section class="section container equipment-section"><img src="./assets/equipment.webp" alt="정돈된 진료 공간의 구강 스캐너와 치아 모형 화면" width="1536" height="1024" loading="lazy"><div><span class="eyebrow">THOUGHTFUL DETAIL</span><h2>보이지 않는 과정에도<br>세심함을 더합니다.</h2><p>상태를 살펴보는 시간부터 치료 계획을 설명하는 순간까지.<br>진료에 필요한 도구와 과정을 이해하기 쉽게 안내합니다.</p><p class="muted small">치료 방법과 사용 장비는 진료 상황에 따라 달라질 수 있습니다.</p></div></section>${cta()}
`;
}
export function serviceDetail(id) {
  const s = serviceById(id);
  if (!s) return notFound();
  return `<section class="container detail-hero ${s.color}"><div><a class="breadcrumb" href="#/services">진료 안내</a><span class="eyebrow">${s.en}</span><h1>${s.name}<span>${s.tag}</span></h1><p>${s.description}</p>${button(`#/booking?service=${s.id}`, `${s.name} 상담 예약`)}</div><div class="detail-symbol" aria-hidden="true">${icon(s.id)}<span>${s.en}</span></div></section><section class="section container detail-content"><div><span class="eyebrow">A PLAN FOR YOU</span><h2>${s.summary}</h2><p>충분히 이해하고 선택할 수 있도록,<br>필요한 과정을 함께 살펴봅니다.</p></div><div class="detail-points">${s.points.map((p) => `<div>${icon("check")}<h3>${p}</h3></div>`).join("")}<p class="muted small">치료의 적합성, 방법, 기간, 비용은 개인 상태에 따라 다릅니다. 상담 후 개별적으로 안내합니다.</p></div></section><section class="faq-section container"><span class="eyebrow">GOOD TO KNOW</span><h2>궁금한 점을 미리 살펴보세요.</h2>${s.faq.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join("")}</section><section class="container section"><div class="section-heading"><h2>다른 진료도 알아보기</h2><a href="#/services" class="text-link">전체 진료</a></div><div class="related-services">${services
    .filter((x) => x.id !== s.id)
    .map(
      (x) =>
        `<a href="#/services/${x.id}">${icon(x.id)}<span>${x.name}</span></a>`,
    )
    .join("")}</div></section>${cta()}`;
}
export function notFound() {
  return `<section class="empty-page container">${icon("tooth")}<h1>페이지를 찾을 수 없어요.</h1><p>아래 버튼으로 건강니 홈을 방문해 주세요.</p>${button("#/", "홈으로 가기")}</section>`;
}
