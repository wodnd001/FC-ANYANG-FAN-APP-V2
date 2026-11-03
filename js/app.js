const splashScreen = document.getElementById('splashScreen');
window.setTimeout(() => { if (splashScreen) splashScreen.remove(); }, 1000);
const messages = {
  ticket: '티켓 메뉴에서 11월 28일 홈 경기 예매 과정을 목업으로 확인할 수 있어요.',
  shop: 'MD SHOP 화면은 다음 버전에서 연결할 예정입니다.',
  schedule: '경기 일정은 예시 콘텐츠입니다. 최신 일정은 구단 공식 채널을 확인해 주세요.',
  events: '구단 이벤트 안내는 준비 중입니다.',
  fan: '팬 참여 메뉴는 준비 중입니다.',
  my: '마이페이지는 준비 중입니다.',
  community: 'FANZONE 커뮤니티는 준비 중입니다.',
  mom: '매치별 MOM 투표는 경기 일정과 함께 준비 중입니다.',
  voice: '고객소리함은 준비 중입니다.',
  notice: '새로운 알림이 없습니다.',
  campusEvent: '캠퍼스 방문 일정은 대학교 제휴 협의 후 안내할 예정입니다.',
  campusDiscount: '안양 소재 대학생 할인 이벤트의 대상·할인율·시행 기간을 준비 중입니다.'
};
const toast = document.getElementById('toast');
const mainScreen = document.getElementById('home');
const participationScreen = document.getElementById('participationScreen');
const ticketScreen = document.getElementById('ticketScreen');
const seatViewScreen = document.getElementById('seatViewScreen');
const matchInfoScreen = document.getElementById('matchInfoScreen');
const matchChatScreen = document.getElementById('matchChatScreen');
const myScreen = document.getElementById('myScreen');
const POINTS_KEY = 'fc-anyang-points';
const MY_VISITS_KEY = 'fc-anyang-my-visits';
const MEMBERSHIP_KEY = 'fc-anyang-membership';
const FANZONE_KEY = 'fc-anyang-fanzone-posts';
const TICKET_BOOKINGS_KEY = 'fc-anyang-bookings';
const AUTH_USER_KEY = 'fc-anyang-current-user';
const AUTH_ACCOUNTS_KEY = 'fc-anyang-demo-accounts';
const MEMBERSHIP_LEVELS = {
  sukabati: { name: 'SUKABATI', label: '지정좌석제 연간회원권', points: 500 },
  violet: { name: 'VIOLET', label: '카드형 연간회원권', points: 400 },
  felico: { name: 'FELICO', label: '예매권북(티켓북)', points: 300 },
  paradizo: { name: 'PARADIZO', label: '15매형 티켓북', points: 250 },
  civitano: { name: 'CIVITANO', label: '10매형 티켓북', points: 200 },
  violet5: { name: 'VIOLET PASS', label: '5매형 티켓북', points: 100 }
};
let timer;
function readMembershipRegistration() {
  try { return JSON.parse(localStorage.getItem(MEMBERSHIP_KEY) || 'null'); }
  catch { return null; }
}
function readFanzonePosts() {
  try { return JSON.parse(localStorage.getItem(FANZONE_KEY) || '[]'); }
  catch { return []; }
}
function countStorageItems(prefix) {
  let count = 0;
  for (let index = 0; index < localStorage.length; index += 1) {
    if (localStorage.key(index)?.startsWith(prefix)) count += 1;
  }
  return count;
}
function getActivityScoreBreakdown() {
  const membership = readMembershipRegistration();
  const level = membership ? MEMBERSHIP_LEVELS[membership.type] : null;
  const visits = readMyVisits().length;
  const fanzonePosts = readFanzonePosts().length;
  const chatMessages = readChatMessages().length;
  const predictions = countStorageItems('fc-anyang-prediction-');
  const attendanceDays = countStorageItems('fc-anyang-attendance-');
  return [
    { label: `멤버십 등급${level ? ` · ${level.name}` : ''}`, points: level?.points || 0 },
    { label: `직관 인증 · ${visits}회`, points: visits * 100 },
    { label: `FANZONE 활동 · ${fanzonePosts}건`, points: fanzonePosts * 20 },
    { label: `MATCH CHAT · ${chatMessages}건`, points: chatMessages * 5 },
    { label: `승부예측 참여 · ${predictions}회`, points: predictions * 10 },
    { label: `출석체크 · ${attendanceDays}일`, points: attendanceDays * 50 }
  ];
}
function getTotalActivityScore() {
  return getActivityScoreBreakdown().reduce((sum, item) => sum + item.points, 0);
}
function showMessage(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function getAttendanceKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `fc-anyang-attendance-${date.getFullYear()}-${month}-${day}`;
}
function renderAttendanceCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const calendar = document.getElementById('attendanceCalendar');
  document.getElementById('attendanceMonth').textContent = `${year}년 ${month + 1}월`;
  calendar.replaceChildren();
  ['일', '월', '화', '수', '목', '금', '토'].forEach((weekday) => {
    const label = document.createElement('span');
    label.className = 'calendar-weekday';
    label.textContent = weekday;
    calendar.append(label);
  });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let blank = 0; blank < firstWeekday; blank += 1) {
    const cell = document.createElement('span');
    cell.className = 'calendar-day empty';
    calendar.append(cell);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement('span');
    cell.className = 'calendar-day';
    cell.textContent = day;
    if (day === today) cell.classList.add('today');
    if (day === today && localStorage.getItem(getAttendanceKey())) cell.classList.add('checked');
    calendar.append(cell);
  }
  while (calendar.children.length % 7 !== 0) {
    const cell = document.createElement('span');
    cell.className = 'calendar-day empty';
    calendar.append(cell);
  }
  const button = document.getElementById('attendanceButton');
  const checkedIn = Boolean(localStorage.getItem(getAttendanceKey()));
  button.disabled = checkedIn;
  button.textContent = checkedIn ? '출석 완료' : '출석하기';
  renderPointBalances();
}
function renderPointBalances() {
  const balance = Number(localStorage.getItem(POINTS_KEY) || 0);
  const balanceView = document.getElementById('pointBalance');
  if (balanceView) balanceView.textContent = balance.toLocaleString('ko-KR');
  const ticketBalanceView = document.getElementById('ticketPointBalance');
  if (ticketBalanceView) ticketBalanceView.textContent = balance.toLocaleString('ko-KR');
  const range = document.getElementById('pointRange');
  const amount = document.getElementById('redeemAmount');
  const note = document.getElementById('pointAvailability');
  const apply = document.getElementById('applyPoints');
  if (!range || !amount || !note || !apply) return;
  const maxRedeemable = Math.floor(balance / 100) * 100;
  const canUse = maxRedeemable >= 1000;
  range.max = String(Math.max(1000, maxRedeemable));
  range.disabled = !canUse;
  range.value = String(canUse ? Math.min(Math.max(Number(range.value), 1000), maxRedeemable) : 1000);
  amount.textContent = canUse ? `${Number(range.value).toLocaleString('ko-KR')} P` : '1,000 P부터 사용';
  note.textContent = canUse
    ? 'FC 안양 앱 회원은 예매 시 100포인트 단위로 사용할 수 있습니다.'
    : `${Math.max(0, 1000 - balance).toLocaleString('ko-KR')}포인트를 더 모으면 예매에 사용할 수 있습니다.`;
  apply.disabled = !canUse;
}

const ticketSeatCatalog = [
  { id: 'variable', zone: 'W석', name: '가변석 R15–R26', gate: 'W 게이트', prices: [['adult','성인',21000],['student','학생(초·중·고)',11000],['child','미취학',6000]] },
  { id: 'designated', zone: 'W석', name: '일반 지정석 2층', gate: 'W 게이트', prices: [['adult','성인',17000],['student','학생(초·중·고)',9000],['child','미취학',5000]] },
  { id: 'south', zone: 'S석', name: '남측 자유석 · 서포터즈석', gate: 'S 게이트', prices: [['adult','성인',16000],['student','학생(초·중·고)',8000],['child','미취학',5000]] },
  { id: 'east', zone: 'E석', name: '일반 자유석 · 중립 응원석', gate: 'E 게이트', prices: [['adult','성인',16000],['student','학생(초·중·고)',8000],['child','미취학',5000]] },
  { id: 'away', zone: 'N석', name: '원정석', gate: '원정 게이트', prices: [['adult','성인',16000],['student','학생(초·중·고)',8000],['child','미취학',5000]] },
  { id: 'tableT2', zone: 'E석', name: '테이블석 T2 · 2인', gate: 'E 게이트', prices: [['pair','2인 세트',100000]] },
  { id: 'tableT3', zone: 'E석', name: '테이블석 T3 · 2인', gate: 'E 게이트', prices: [['pair','2인 세트',60000]] },
  { id: 'picnicT4-2', zone: 'E석', name: '피크닉존 테이블석 T4 · 2인', gate: 'E 게이트', prices: [['pair','2인 세트',60000]] },
  { id: 'picnicT4-3', zone: 'E석', name: '피크닉존 테이블석 T4 · 3인', gate: 'E 게이트', prices: [['triple','3인 세트',90000]] },
  { id: 'picnicP', zone: 'E석', name: '피크닉존 돗자리석 P', gate: 'E 게이트', prices: [['2p','2인',42000],['4p','4인',84000],['8p','8인',168000],['10p','10인',210000]] }
];
let selectedTicketZone = '';
let selectedTicketSeat = null;
let ticketCounts = {};
let ticketMapView = { x: 0, y: 0, w: 997, h: 709 };
function showTicketStage(stage) {
  const stages = { wallet:['나의 티켓','MY TICKETS'], qr:['입장 QR','MOBILE TICKET'], seats:['좌석 선택','2026.11.28 · HOME MATCH'], price:['가격 선택','2026.11.28 · HOME MATCH'], buyer:['예매 정보 입력','2026.11.28 · HOME MATCH'], complete:['예매 완료','2026.11.28 · HOME MATCH'] };
  const stageIds = { wallet:'ticketWalletStage', qr:'ticketQrStage', seats:'ticketSeatsStage', price:'ticketPriceStage', buyer:'ticketBuyerStage', complete:'ticketCompleteStage' };
  document.querySelectorAll('#ticketScreen .ticket-flow-stage').forEach((item) => { item.hidden = item.id !== stageIds[stage]; });
  document.getElementById('ticketStageTitle').textContent = stages[stage][0];
  document.getElementById('ticketStageEyebrow').textContent = stages[stage][1];
  document.getElementById('ticketStageBack').hidden = !['qr','price','buyer'].includes(stage);
  document.getElementById('ticketClose').hidden = stage === 'wallet';
  document.getElementById('ticketMatchBanner').hidden = ['wallet','qr'].includes(stage);
  document.getElementById('ticketOptionsSheet').hidden = stage !== 'seats';
  document.getElementById('ticketMapWrap').hidden = stage !== 'seats';
  document.querySelector('.ticket-map-zoom').hidden = stage !== 'seats';
}
function getTicketBookings() {
  try { return JSON.parse(localStorage.getItem(TICKET_BOOKINGS_KEY) || '[]'); } catch { return []; }
}
function renderTicketSeatOptions() {
  const list = document.getElementById('ticketSeatOptionList');
  list.replaceChildren();
  const options = selectedTicketZone ? ticketSeatCatalog.filter((item) => item.zone === selectedTicketZone) : ticketSeatCatalog;
  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'ticket-seat-option';
    button.classList.toggle('selected', selectedTicketSeat?.id === option.id);
    button.innerHTML = `<span class="ticket-seat-dot"></span><span><b></b><small></small></span><span class="ticket-seat-price"></span>`;
    button.querySelector('b').textContent = option.name;
    button.querySelector('small').textContent = `${option.zone} · ${option.gate} · 잔여석 연동 전`;
    button.querySelector('.ticket-seat-price').textContent = '가격 선택';
    button.addEventListener('click', () => { selectedTicketSeat = option; selectedTicketZone = option.zone; renderTicketSeatOptions(); zoomTicketZone(option.zone); document.getElementById('ticketSelectedLabel').textContent = `${option.name}을(를) 선택했어요.`; document.getElementById('ticketSeatContinue').disabled = false; });
    list.append(button);
  });
  if (!selectedTicketSeat) document.getElementById('ticketSelectedLabel').textContent = selectedTicketZone ? `${selectedTicketZone} 관람 구역 옵션` : '좌석 구역을 선택하면 옵션이 표시됩니다.';
}
function setTicketSheetExpanded(expanded) {
  const sheet = document.getElementById('ticketOptionsSheet');
  const handle = document.getElementById('ticketSheetHandle');
  sheet.classList.toggle('expanded', expanded); handle.setAttribute('aria-expanded', String(expanded));
  handle.querySelector('b').textContent = expanded ? '관람 구역 옵션' : '위로 올려 좌석 옵션 보기';
  handle.querySelector('i').textContent = expanded ? '⌄' : '⌃';
}
function zoomTicketZone(zone) {
  const shape = document.querySelector(`#ticketStadiumSvg [data-ticket-seat-zone="${zone}"]`);
  if (!shape) return;
  const b = shape.getBBox(); const pad = 24;
  const w = Math.max(150, b.width + pad * 2); const h = Math.max(130, b.height + pad * 2);
  ticketMapView = { x: b.x + b.width / 2 - w / 2, y: b.y + b.height / 2 - h / 2, w, h };
  document.getElementById('ticketStadiumSvg').setAttribute('viewBox', `${ticketMapView.x} ${ticketMapView.y} ${w} ${h}`);
}
function changeTicketZoom(factor) {
  const svg = document.getElementById('ticketStadiumSvg');
  const w = Math.min(997, Math.max(150, ticketMapView.w * factor)); const h = Math.min(709, Math.max(110, ticketMapView.h * factor));
  ticketMapView = { x: ticketMapView.x + (ticketMapView.w - w) / 2, y: ticketMapView.y + (ticketMapView.h - h) / 2, w, h };
  svg.setAttribute('viewBox', `${ticketMapView.x} ${ticketMapView.y} ${w} ${h}`);
}
function resetTicketMap() { ticketMapView = { x:0, y:0, w:997, h:709 }; document.getElementById('ticketStadiumSvg').setAttribute('viewBox', '0 0 997 709'); }
const ticketPointers = new Map();
let ticketPinchDistance = 0;
const ticketMapSvg = document.getElementById('ticketStadiumSvg');
ticketMapSvg.addEventListener('pointerdown',(event)=>{ticketPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(ticketPointers.size===2){const [a,b]=[...ticketPointers.values()];ticketPinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}});
ticketMapSvg.addEventListener('pointermove',(event)=>{if(!ticketPointers.has(event.pointerId))return;ticketPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(ticketPointers.size<2)return;const [a,b]=[...ticketPointers.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y);if(ticketPinchDistance&&Math.abs(distance-ticketPinchDistance)>8){changeTicketZoom(distance>ticketPinchDistance ? .9 : 1.1);ticketPinchDistance=distance;event.preventDefault();}});
['pointerup','pointercancel','pointerleave'].forEach((type)=>ticketMapSvg.addEventListener(type,(event)=>{ticketPointers.delete(event.pointerId);if(ticketPointers.size<2)ticketPinchDistance=0;}));
function renderTicketPrices() {
  const wrap = document.getElementById('ticketPriceOptions'); wrap.replaceChildren(); ticketCounts = {};
  selectedTicketSeat.prices.forEach(([key,label,price]) => {
    ticketCounts[key] = 0;
    const row = document.createElement('article'); row.className = 'ticket-price-row';
    const info = document.createElement('div'); info.innerHTML = '<b></b><strong></strong>'; info.querySelector('b').textContent = label; info.querySelector('strong').textContent = `${price.toLocaleString('ko-KR')}원`;
    const controls = document.createElement('div'); controls.className = 'ticket-stepper';
    const minus = document.createElement('button'); minus.type='button'; minus.textContent='−';
    const count = document.createElement('span'); count.textContent='0';
    const plus = document.createElement('button'); plus.type='button'; plus.textContent='＋';
    minus.addEventListener('click', () => { ticketCounts[key] = Math.max(0,ticketCounts[key]-1); count.textContent=ticketCounts[key]; updateTicketTotal(); });
    plus.addEventListener('click', () => { const total=Object.values(ticketCounts).reduce((a,b)=>a+b,0); if(total>=6){showMessage('한 번에 최대 6매까지 선택할 수 있어요.');return;} ticketCounts[key]+=1; count.textContent=ticketCounts[key]; updateTicketTotal(); });
    controls.append(minus,count,plus); row.append(info,controls); wrap.append(row);
  });
  document.getElementById('ticketPriceSummary').textContent = `${selectedTicketSeat.name} · ${selectedTicketSeat.gate}`;
  updateTicketTotal();
}
function updateTicketTotal() {
  const total = selectedTicketSeat.prices.reduce((sum,[key,,price])=>sum+(ticketCounts[key]||0)*price,0);
  document.getElementById('ticketGrandTotal').textContent = `${total.toLocaleString('ko-KR')}원`;
  document.getElementById('ticketPriceContinue').disabled = total === 0;
}
function ticketOrderSummary() {
  const items = selectedTicketSeat.prices.filter(([key])=>ticketCounts[key]>0).map(([key,label,price])=>({label,count:ticketCounts[key],price}));
  const total = items.reduce((sum,item)=>sum+item.count*item.price,0);
  return { items,total };
}
function renderMyBookings() {
  const list = document.getElementById('myBookingsList'); const empty = document.getElementById('myBookingsEmpty');
  if (!list || !empty) return;
  list.replaceChildren(); const bookings = getTicketBookings(); empty.hidden = bookings.length > 0;
  [...bookings].reverse().forEach((booking) => {
    const card = document.createElement('article'); card.className='my-booking-card';
    const title=document.createElement('h3'); title.textContent=booking.match;
    const date=document.createElement('p'); date.textContent=`${booking.dateLabel} · 안양종합운동장`;
    const seat=document.createElement('p'); seat.textContent=`${booking.seat} · ${booking.gate}`;
    const items=document.createElement('p'); items.textContent=booking.items.map((item)=>`${item.label} ${item.count}매`).join(' · ');
    const total=document.createElement('strong'); total.textContent=`${booking.total.toLocaleString('ko-KR')}원 · 시연 예약`;
    card.append(title,date,seat,items,total); list.append(card);
  });
}
function renderTicketWallet() {
  const list = document.getElementById('ticketWalletList'); const empty = document.getElementById('ticketWalletEmpty');
  list.replaceChildren(); const bookings = getTicketBookings(); const membership=readMembershipRegistration(); const membershipLevel=membership?MEMBERSHIP_LEVELS[membership.type]:null; empty.hidden = bookings.length > 0 || Boolean(membershipLevel);
  if(membershipLevel){
    const card=document.createElement('button');card.type='button';card.className='ticket-wallet-card season-wallet-card';
    const top=document.createElement('span');top.className='ticket-wallet-card-top';top.innerHTML='<b>FC ANYANG</b><small>2026 SEASON TICKET　›</small>';
    const title=document.createElement('strong');title.className='ticket-wallet-match';title.textContent=`${membershipLevel.name} 시즌권`;
    const detail=document.createElement('span');detail.className='ticket-wallet-date';detail.textContent=membership.type==='sukabati'?(membership.seatInfo?`지정석 · ${membership.seatInfo}`:'지정좌석 연간회원권'):`${membershipLevel.label} · 2026 시즌`;
    const foot=document.createElement('span');foot.className='ticket-wallet-rule';const label=document.createElement('b');label.textContent=membershipLevel.label;const action=document.createElement('small');action.textContent='시즌권 열기';foot.append(label,action);card.append(top,title,detail,foot);card.addEventListener('click',()=>openMembershipQr(membership,membershipLevel));list.append(card);
  }
  [...bookings].reverse().forEach((booking) => {
    const card = document.createElement('button'); card.type='button'; card.className='ticket-wallet-card';
    const top=document.createElement('span'); top.className='ticket-wallet-card-top'; top.innerHTML='<b>FC ANYANG</b><small>모바일 티켓　›</small>';
    const match=document.createElement('strong'); match.className='ticket-wallet-match'; match.textContent=booking.match;
    const date=document.createElement('span'); date.className='ticket-wallet-date'; date.textContent=`${booking.dateLabel} · 안양종합운동장`;
    const rule=document.createElement('span'); rule.className='ticket-wallet-rule';
    const seat=document.createElement('b'); seat.textContent=booking.seat;
    const info=document.createElement('small'); info.textContent=`${booking.items.reduce((sum,item)=>sum+item.count,0)}매 · ${booking.total.toLocaleString('ko-KR')}원`;
    rule.append(seat,info); card.append(top,match,date,rule);
    card.addEventListener('click',()=>openTicketQr(booking)); list.append(card);
  });
}
function openTicketQr(booking) {
  document.getElementById('ticketQrMembershipType').hidden=true;
  document.getElementById('ticketQrMatch').textContent=booking.match;
  document.getElementById('ticketQrDate').textContent=`${booking.dateLabel} · 안양종합운동장`;
  document.getElementById('ticketQrId').textContent=`TICKET ${booking.id.replace(/[^a-z0-9]/gi,'').slice(-12).toUpperCase()}`;
  document.getElementById('ticketQrSeat').textContent=`${booking.seat} · ${booking.gate} · ${booking.items.map((item)=>`${item.label} ${item.count}매`).join(' · ')}`;
  renderTicketQrPattern(document.getElementById('ticketQrZone'),booking.id);
  showTicketStage('qr');
}
function openMembershipQr(membership,level){
  document.getElementById('ticketQrMembershipType').hidden=false;
  document.getElementById('ticketQrMatch').textContent=`FC ANYANG · ${level.name}`;
  document.getElementById('ticketQrDate').textContent='2026 시즌 회원권';
  document.getElementById('ticketQrId').textContent=`MEMBER CARD · •••••••••${membership.barcode.slice(-4)}`;
  document.getElementById('ticketQrMembershipType').textContent=level.label;
  document.getElementById('ticketQrSeat').textContent=membership.type==='sukabati'?(membership.seatInfo?`지정석 · ${membership.seatInfo}`:'지정석 · 좌석 정보 미등록'):level.label;
  renderTicketQrPattern(document.getElementById('ticketQrZone'),membership.barcode);
  showTicketStage('qr');
}
function renderTicketQrPattern(host,seedText){
  host.replaceChildren();
  const ns='http://www.w3.org/2000/svg'; const svg=document.createElementNS(ns,'svg'); svg.setAttribute('viewBox','0 0 29 29'); svg.setAttribute('role','img'); svg.setAttribute('aria-label','시연용 입장 QR 코드');
  const bg=document.createElementNS(ns,'rect'); bg.setAttribute('width','29');bg.setAttribute('height','29');bg.setAttribute('fill','#fff');svg.append(bg);
  let seed=[...seedText].reduce((value,char)=>((value*31)+char.charCodeAt(0))>>>0,17); const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const matrix=Array.from({length:29},()=>Array(29).fill(false));
  const finder=(ox,oy)=>{for(let y=0;y<7;y++)for(let x=0;x<7;x++)matrix[oy+y][ox+x]=(x===0||x===6||y===0||y===6||(x>=2&&x<=4&&y>=2&&y<=4));};
  finder(1,1);finder(21,1);finder(1,21);
  for(let y=0;y<29;y++)for(let x=0;x<29;x++){const reserved=(x<9&&y<9)||(x>19&&y<9)||(x<9&&y>19);if(!reserved)matrix[y][x]=rand()>.52;}
  finder(1,1);finder(21,1);finder(1,21);
  matrix.forEach((row,y)=>row.forEach((on,x)=>{if(on){const cell=document.createElementNS(ns,'rect');cell.setAttribute('x',String(x));cell.setAttribute('y',String(y));cell.setAttribute('width','1');cell.setAttribute('height','1');cell.setAttribute('fill','#17121e');svg.append(cell);}}));
  host.append(svg);
}
document.querySelectorAll('#ticketStadiumSvg [data-ticket-seat-zone]').forEach((zone) => {
  const choose = () => { document.querySelectorAll('#ticketStadiumSvg [data-ticket-seat-zone]').forEach((item)=>item.classList.remove('selected')); zone.classList.add('selected'); selectedTicketZone=zone.dataset.ticketSeatZone; selectedTicketSeat=null; renderTicketSeatOptions(); setTicketSheetExpanded(true); zoomTicketZone(selectedTicketZone); };
  zone.addEventListener('click', choose); zone.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose();}});
});
const ticketSheet = document.getElementById('ticketOptionsSheet');
const ticketSheetHandle = document.getElementById('ticketSheetHandle');
ticketSheetHandle.addEventListener('click',()=>{if(ticketSheet.dataset.swiped){delete ticketSheet.dataset.swiped;return;}setTicketSheetExpanded(!ticketSheet.classList.contains('expanded'));});
let sheetSwipeY=0;
ticketSheet.addEventListener('pointerdown',(event)=>{sheetSwipeY=event.clientY;});
ticketSheet.addEventListener('pointerup',(event)=>{const delta=event.clientY-sheetSwipeY;if(Math.abs(delta)>35){ticketSheet.dataset.swiped='true';setTicketSheetExpanded(delta<0);}});
document.getElementById('ticketZoomIn').addEventListener('click',()=>changeTicketZoom(.78));
document.getElementById('ticketZoomOut').addEventListener('click',()=>changeTicketZoom(1.28));
document.getElementById('ticketZoomReset').addEventListener('click',resetTicketMap);
document.getElementById('ticketSeatContinue').addEventListener('click',()=>{if(!selectedTicketSeat)return;renderTicketPrices();showTicketStage('price');});
document.getElementById('ticketClose').addEventListener('click',()=>{
  ticketScreen.hidden=true; mainScreen.hidden=false; participationScreen.hidden=true; seatViewScreen.hidden=true; matchInfoScreen.hidden=true; matchChatScreen.hidden=true; myScreen.hidden=true;
  document.querySelectorAll('.bottom-nav button').forEach((item)=>item.classList.remove('active'));
  document.querySelector('.bottom-nav [data-action="home"]').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
});
document.getElementById('ticketStageBack').addEventListener('click',()=>{if(!document.getElementById('ticketQrStage').hidden){showTicketStage('wallet');return;}if(!document.getElementById('ticketBuyerStage').hidden){document.getElementById('ticketBuyerForm').reset();showTicketStage('price');}else showTicketStage('seats');});
document.getElementById('ticketPriceContinue').addEventListener('click',()=>{document.getElementById('ticketBuyerSummary').textContent=`${selectedTicketSeat.name} · ${ticketOrderSummary().items.map((item)=>`${item.label} ${item.count}매`).join(' · ')} · ${ticketOrderSummary().total.toLocaleString('ko-KR')}원`;showTicketStage('buyer');});
document.getElementById('ticketBuyerForm').addEventListener('submit',(event)=>{
  event.preventDefault(); if(!event.currentTarget.reportValidity())return;
  const form=new FormData(event.currentTarget); const order=ticketOrderSummary();
  const booking={id:`demo-${Date.now()}`,date:'2026-11-28',dateLabel:'2026년 11월 28일(토) 14:00',match:'FC 안양 vs 제주SK FC',seat:selectedTicketSeat.name,gate:selectedTicketSeat.gate,items:order.items,total:order.total,purchaser:String(form.get('buyerName')).trim(),phoneLast4:String(form.get('phone')).replace(/\D/g,'').slice(-4),createdAt:new Date().toISOString(),demo:true};
  const bookings=getTicketBookings();bookings.push(booking);localStorage.setItem(TICKET_BOOKINGS_KEY,JSON.stringify(bookings));
  document.getElementById('ticketCompleteSummary').textContent=`${booking.match} · ${booking.seat} · ${booking.total.toLocaleString('ko-KR')}원`;
  renderMyBookings();showTicketStage('complete');
});
document.getElementById('ticketGoMyBookings').addEventListener('click',()=>{renderTicketWallet();showTicketStage('wallet');});
document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action !== 'my') myScreen.hidden = true;
    if (action !== 'match-chat') matchChatScreen.hidden = true;
    if (button.closest('.bottom-nav')) {
      stopMyCamera();
      stopMembershipCamera();
      document.querySelectorAll('.bottom-nav button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      [participationScreen, ticketScreen, seatViewScreen, matchInfoScreen, matchChatScreen, myScreen].forEach((screen) => { screen.hidden = true; });
    }
    if (action === 'home') {
      mainScreen.hidden = false;
      participationScreen.hidden = true;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = true;
      matchInfoScreen.hidden = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'fan') {
      document.querySelectorAll('.bottom-nav button').forEach((item) => item.classList.remove('active'));
      document.querySelector('.bottom-nav [data-action="fan"]').classList.add('active');
      mainScreen.hidden = true;
      participationScreen.hidden = false;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = true;
      matchInfoScreen.hidden = true;
      selectParticipationPage('attendance');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'ticket') {
      document.querySelectorAll('.bottom-nav button').forEach((item) => item.classList.remove('active'));
      document.querySelector('.bottom-nav [data-action="ticket"]').classList.add('active');
      mainScreen.hidden = true;
      participationScreen.hidden = true;
      ticketScreen.hidden = false;
      seatViewScreen.hidden = true;
      showTicketStage('wallet');
      renderTicketWallet();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'reserve') {
      [mainScreen, participationScreen, ticketScreen, seatViewScreen, matchInfoScreen, matchChatScreen, myScreen].forEach((screen) => { screen.hidden = true; });
      ticketScreen.hidden = false;
      document.querySelectorAll('.bottom-nav button').forEach((item) => item.classList.remove('active'));
      document.querySelector('.bottom-nav [data-action="ticket"]').classList.add('active');
      resetTicketMap(); showTicketStage('seats'); renderTicketSeatOptions(); setTicketSheetExpanded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'my') {
      mainScreen.hidden = true;
      participationScreen.hidden = true;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = true;
      matchInfoScreen.hidden = true;
      matchChatScreen.hidden = true;
      myScreen.hidden = false;
      openMyView('home');
      renderMyProfile();
      renderMyRecords();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'seatview') {
      mainScreen.hidden = true;
      participationScreen.hidden = true;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'schedule') {
      document.querySelectorAll('.bottom-nav button').forEach((item) => item.classList.remove('active'));
      document.querySelector('.bottom-nav [data-action="schedule"]').classList.add('active');
      mainScreen.hidden = true;
      participationScreen.hidden = true;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = true;
      matchInfoScreen.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'prediction') {
      document.querySelectorAll('.bottom-nav button').forEach((item) => item.classList.remove('active'));
      document.querySelector('.bottom-nav [data-action="fan"]').classList.add('active');
      mainScreen.hidden = true;
      participationScreen.hidden = false;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = true;
      matchInfoScreen.hidden = true;
      selectParticipationPage('prediction');
      renderPrediction();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'match-chat') {
      mainScreen.hidden = true;
      participationScreen.hidden = true;
      ticketScreen.hidden = true;
      seatViewScreen.hidden = true;
      matchInfoScreen.hidden = true;
      matchChatScreen.hidden = false;
      renderChat();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'campus-event') {
      showMessage(messages.campusEvent);
      return;
    }
    if (action === 'campus-discount') {
      showMessage(messages.campusDiscount);
      return;
    }
    showMessage(messages[action] || '준비 중인 기능입니다.');
  });
});
document.getElementById('noticeButton').addEventListener('click', () => showMessage(messages.notice));
const predictionFixtures = [
  { id: '2026-11-07', kickoff: '2026-11-07T16:30:00+09:00', home: '김천', away: '안양', venue: '김천종합운동장 · AWAY' },
  { id: '2026-11-21', kickoff: '2026-11-21T14:00:00+09:00', home: '포항', away: '안양', venue: '포항스틸야드 · AWAY' },
  { id: '2026-11-28', kickoff: '2026-11-28T14:00:00+09:00', home: '안양', away: '제주', venue: '안양종합운동장 · HOME' },
  { id: '2026-12-05', kickoff: '2026-12-05T14:00:00+09:00', home: '안양', away: '광주', venue: '안양종합운동장 · HOME' }
];
const predictionSelections = {};
const predictionWindowMs = 7 * 24 * 60 * 60 * 1000;
function predictionStorageKey(match) {
  return `fc-anyang-prediction-${match.id}`;
}
function renderPrediction() {
  const list = document.getElementById('participationPredictionList');
  const now = new Date();
  list.replaceChildren();
  predictionFixtures.filter((match) => new Date(match.kickoff) > now).forEach((match) => {
    const kickoff = new Date(match.kickoff);
    const opensAt = new Date(kickoff.getTime() - predictionWindowMs);
    const isOpen = now >= opensAt && now < kickoff;
    const saved = localStorage.getItem(predictionStorageKey(match));
    const selected = saved || predictionSelections[match.id] || '';
    const card = document.createElement('article');
    card.className = 'prediction-match-card';

    const meta = document.createElement('div');
    meta.className = 'prediction-match-meta';
    meta.textContent = `${kickoff.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} · ${kickoff.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    const title = document.createElement('h3');
    title.textContent = `${match.home} vs ${match.away}`;
    const venue = document.createElement('div');
    venue.className = 'prediction-match-venue';
    venue.textContent = match.venue;
    card.append(meta, title, venue);

    const choices = document.createElement('div');
    choices.className = 'prediction-choice-row';
    const outcomes = [
      { key: 'home', label: `${match.home} 승` },
      { key: 'draw', label: '무승부' },
      { key: 'away', label: `${match.away} 승` }
    ];
    outcomes.forEach((outcome) => {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.textContent = outcome.label;
      choice.disabled = !isOpen || Boolean(saved);
      choice.classList.toggle('selected', selected === outcome.key);
      choice.addEventListener('click', () => {
        predictionSelections[match.id] = outcome.key;
        renderPrediction();
      });
      choices.append(choice);
    });
    card.append(choices);

    const status = document.createElement('p');
    status.className = `prediction-card-status${isOpen && !saved ? ' open' : ''}`;
    if (saved) status.textContent = `내 예측: ${outcomes.find((item) => item.key === saved)?.label || '참여 완료'} · 이 기기에서 참여 완료`;
    else if (isOpen) status.textContent = '지금 참여 가능 · 킥오프 전까지';
    else status.textContent = `예측 오픈: ${opensAt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} ${opensAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    card.append(status);

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'participation-action prediction-submit';
    submit.textContent = saved ? '참여 완료' : isOpen ? '예측 참여하기' : '예측 기간 전';
    submit.disabled = !isOpen || Boolean(saved) || !selected;
    submit.addEventListener('click', () => {
      localStorage.setItem(predictionStorageKey(match), selected);
      renderPrediction();
      renderMyRecords();
      showMessage(`${match.home} vs ${match.away} 예측에 참여했습니다.`);
    });
    card.append(submit);
    list.append(card);
  });
}
const chatKey = 'fc-anyang-match-chat-2026-11-28';
function readChatMessages() {
  try {
    return JSON.parse(localStorage.getItem(chatKey) || '[]');
  } catch {
    return [];
  }
}
function renderChat() {
  const log = document.getElementById('chatLog');
  const messagesForMatch = readChatMessages();
  log.replaceChildren();
  if (messagesForMatch.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'chat-empty';
    empty.innerHTML = '아직 메시지가 없습니다.<br>첫 응원을 남겨보세요!';
    log.append(empty);
    return;
  }
  messagesForMatch.forEach((message) => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-message mine';
    bubble.append(document.createTextNode(message.text));
    const time = document.createElement('time');
    time.textContent = message.time;
    bubble.append(time);
    log.append(bubble);
  });
  log.scrollTop = log.scrollHeight;
}
document.getElementById('matchChatForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  const messagesForMatch = readChatMessages();
  messagesForMatch.push({ text, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) });
  localStorage.setItem(chatKey, JSON.stringify(messagesForMatch.slice(-100)));
  input.value = '';
  renderChat();
  renderMyRecords();
});
document.querySelectorAll('[data-seat-zone]').forEach((zone) => {
  const selectZone = () => {
    document.querySelectorAll('[data-seat-zone]').forEach((item) => item.classList.remove('selected'));
    zone.classList.add('selected');
    zone.setAttribute('aria-pressed', 'true');
    document.querySelectorAll('[data-seat-zone]').forEach((item) => {
      if (item !== zone) item.setAttribute('aria-pressed', 'false');
    });
    document.getElementById('seatViewSelected').textContent = `${zone.dataset.seatZone} 선택`;
    const descriptions = {
      'W석': 'R15~R26 구역이 표시된 서쪽 관람석입니다. 일반 지정석·자유석과 가변석 구역은 경기별 운영을 확인하세요.',
      'S석': '남측 관람 구역입니다. 서포터즈석과 남측 자유석은 경기별 좌석 운영을 확인하세요.',
      'E석': 'R6~R9 및 T·P 구역 방향입니다. 테이블석과 피크닉석은 온라인 전용 판매 구역입니다.',
      'N석': 'R1~R5 및 원정석 방향입니다. 원정 관람객은 원정 게이트(2층)를 이용하세요.'
    };
    document.getElementById('seatViewDescription').textContent = `${descriptions[zone.dataset.seatZone]} 실제 사진 시야는 연동 준비 중입니다.`;
  };
  zone.setAttribute('aria-pressed', 'false');
  zone.addEventListener('click', selectZone);
  zone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectZone();
    }
  });
});
function selectParticipationPage(pageName) {
  document.querySelectorAll('[data-participation-tab]').forEach((tab) => {
    const selected = tab.dataset.participationTab === pageName;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
  document.querySelectorAll('[data-participation-page]').forEach((page) => {
    const selected = page.dataset.participationPage === pageName;
    page.classList.toggle('active', selected);
    page.hidden = !selected;
  });
  const title = document.querySelector(`[data-participation-tab="${pageName}"]`);
  document.getElementById('participationTitle').textContent = title.textContent;
}
document.querySelectorAll('[data-participation-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    selectParticipationPage(tab.dataset.participationTab);
    if (tab.dataset.participationTab === 'prediction') renderPrediction();
    if (tab.dataset.participationTab === 'community') renderFanzonePosts();
  });
});
document.querySelectorAll('[data-participation-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.participationAction;
    if (action === 'attendance') {
      if (localStorage.getItem(getAttendanceKey())) return;
      localStorage.setItem(getAttendanceKey(), 'checked');
      const balance = Number(localStorage.getItem(POINTS_KEY) || 0) + 50;
      localStorage.setItem(POINTS_KEY, String(balance));
      renderAttendanceCalendar();
      renderMyRecords();
      showMessage(`출석 완료! 50포인트 적립 · 총 ${balance.toLocaleString('ko-KR')}P`);
      return;
    }
    if (action === 'community') {
      const form = document.getElementById('communityPostForm');
      form.hidden = false;
      document.getElementById('communityPostInput').focus();
      return;
    }
    if (action === 'mom' && !document.querySelector('[data-mom-vote].selected')) {
      showMessage('투표할 선수를 먼저 선택해주세요.');
      return;
    }
    if (action === 'mom') showMessage('투표가 완료되었습니다. (시연용)');
    else showMessage(messages[action]);
  });
});
renderAttendanceCalendar();
document.getElementById('pointRange')?.addEventListener('input', (event) => {
  document.getElementById('redeemAmount').textContent = `${Number(event.target.value).toLocaleString('ko-KR')} P`;
});
document.getElementById('applyPoints')?.addEventListener('click', () => {
  showMessage('FC 안양 앱 회원 로그인과 실제 티켓 예매 연동 후 사용할 수 있습니다.');
});
document.querySelectorAll('[data-mom-vote]').forEach((candidate) => {
  candidate.addEventListener('click', () => {
    document.querySelectorAll('[data-mom-vote]').forEach((item) => item.classList.remove('selected'));
    candidate.classList.add('selected');
  });
});
document.getElementById('voiceForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const field = event.currentTarget.querySelector('textarea');
  if (!field.value.trim()) {
    showMessage('의견을 입력해주세요.');
    return;
  }
  showMessage('의견 접수는 시연용 화면입니다.');
  field.value = '';
});
function readMyVisits() {
  try { return JSON.parse(localStorage.getItem(MY_VISITS_KEY) || '[]'); }
  catch { return []; }
}
function renderMyRecords() {
  const visits = readMyVisits();
  const wins = visits.filter((visit) => visit.outcome === 'win').length;
  const losses = visits.filter((visit) => visit.outcome === 'loss').length;
  const rate = visits.length ? Math.round((wins / visits.length) * 100) : null;
  document.getElementById('myVisitCount').textContent = visits.length;
  document.getElementById('myWinCount').textContent = wins;
  document.getElementById('myWinRate').textContent = rate === null ? '—' : `${rate}%`;
  const scoreBreakdown = getActivityScoreBreakdown();
  document.getElementById('mySeasonPoints').textContent = scoreBreakdown.reduce((sum, item) => sum + item.points, 0).toLocaleString('ko-KR');
  const breakdownList = document.getElementById('myScoreBreakdown');
  breakdownList.replaceChildren();
  scoreBreakdown.forEach((item) => {
    const line = document.createElement('li');
    line.textContent = `${item.label}: ${item.points.toLocaleString('ko-KR')}점`;
    breakdownList.append(line);
  });
  const title = document.getElementById('myFanTitle');
  const subtitle = document.getElementById('myFanSubtitle');
  if (visits.length >= 3 && rate >= 60) {
    title.textContent = '오늘의 승요 💜';
    subtitle.textContent = `직관 승률 ${rate}% · 보라의 승리 기운을 나눠요!`;
  } else if (visits.length >= 3 && losses > wins) {
    title.textContent = '오늘의 패요 탈출 준비 중';
    subtitle.textContent = `직관 ${visits.length}회 · 다음 경기에서 승요에 도전해요!`;
  } else if (visits.length) {
    title.textContent = '안양과 함께한 날들';
    subtitle.textContent = `직관 ${visits.length}회 · 나만의 응원 기록이 쌓이고 있어요.`;
  } else {
    title.textContent = '오늘도 안양과 함께';
    subtitle.textContent = '첫 직관 인증을 기다리고 있어요.';
  }
  renderMatchCalendars();
  const history = document.getElementById('myHistoryList');
  history.replaceChildren();
  if (!visits.length) {
    const empty = document.createElement('p');
    empty.className = 'my-empty-history';
    empty.textContent = '아직 기록된 직관이 없습니다.';
    history.append(empty);
  } else [...visits].reverse().forEach((visit) => {
      const row = document.createElement('div');
      row.className = 'my-history-row';
      const date = document.createElement('strong');
      date.textContent = visit.dateLabel || visit.date;
      const result = document.createElement('span');
      result.textContent = ({ win: '승리 💜', draw: '무승부', loss: '패배' })[visit.outcome] || '결과 기록';
      row.append(date, result);
      history.append(row);
    });
  const checkinHistory = document.getElementById('myCheckinHistory');
  checkinHistory.replaceChildren();
  if (!visits.length) {
    const empty = document.createElement('p');
    empty.className = 'my-empty-history';
    empty.textContent = '아직 체크인 기록이 없습니다.';
    checkinHistory.append(empty);
  }
  [...visits].reverse().forEach((visit) => {
    const row = document.createElement('div');
    row.className = 'my-history-row';
    const date = document.createElement('strong');
    date.textContent = visit.dateLabel || visit.date;
    const result = document.createElement('span');
    result.textContent = ({ win: '직관 인증 완료 · 승리', draw: '직관 인증 완료 · 무승부', loss: '직관 인증 완료 · 패배' })[visit.outcome] || '직관 인증 완료';
    row.append(date, result);
    checkinHistory.append(row);
  });
}
const anyangMatches2026 = [
  ['2026-03-02','대전하나시티즌','14:00','대전월드컵경기장','K리그1'],['2026-03-08','제주SKFC','16:30','안양종합운동장','K리그1'],['2026-03-15','강원FC','16:30','강릉하이원아레나','K리그1'],['2026-03-18','전북현대','19:30','전주월드컵경기장','K리그1'],['2026-03-22','인천유나이티드','16:30','안양종합운동장','K리그1'],
  ['2026-04-05','FC서울','14:00','안양종합운동장','K리그1'],['2026-04-12','김천상무','16:30','김천종합운동장','K리그1'],['2026-04-19','포항스틸러스','16:30','포항스틸야드','K리그1'],['2026-04-22','울산HD','19:30','안양종합운동장','K리그1'],['2026-04-26','광주FC','16:30','광주월드컵경기장','K리그1'],
  ['2026-05-02','부천FC1995','19:00','안양종합운동장','K리그1'],['2026-05-05','FC서울','19:00','서울월드컵경기장','K리그1'],['2026-05-10','전북현대','16:30','안양종합운동장','K리그1'],['2026-05-13','김천상무','19:30','안양종합운동장','K리그1'],['2026-05-17','제주SKFC','16:30','제주월드컵경기장','K리그1'],
  ['2026-07-04','포항스틸러스','19:30','안양종합운동장','K리그1'],['2026-07-12','인천유나이티드','19:30','인천축구전용경기장','K리그1'],['2026-07-19','광주FC','19:30','안양종합운동장','K리그1'],['2026-07-22','부천FC1995','19:30','부천종합운동장','K리그1'],['2026-07-26','강원FC','19:30','안양종합운동장','K리그1'],['2026-07-29','충북청주FC','19:30','청주종합경기장','코리아컵'],
  ['2026-08-02','울산HD','19:30','울산문수축구경기장','K리그1'],['2026-08-08','대전하나시티즌','20:00','안양종합운동장','K리그1'],['2026-08-15','제주SKFC','19:30','제주월드컵경기장','K리그1'],['2026-08-19','제주SKFC','19:30','안양종합운동장','코리아컵'],['2026-08-22','FC서울','19:30','안양종합운동장','K리그1'],['2026-08-26','인천유나이티드','19:30','안양종합운동장','K리그1'],['2026-08-29','부천FC1995','19:30','부천종합운동장','K리그1'],
  ['2026-09-06','강원FC','19:00','안양종합운동장','K리그1'],['2026-09-09','대전하나시티즌','19:30','대전월드컵경기장','K리그1'],['2026-09-13','광주FC','19:00','광주월드컵경기장','K리그1'],['2026-09-19','울산HD','19:00','안양종합운동장','K리그1'],
  ['2026-10-10','김천상무','16:30','김천종합운동장','K리그1'],['2026-10-18','포항스틸러스','16:30','포항스틸야드','K리그1'],['2026-10-24','전북현대','14:00','안양종합운동장','K리그1'],
  ['2026-11-01','부천FC1995','16:30','안양종합운동장','K리그1'],['2026-11-07','김천상무','16:30','김천종합운동장','K리그1'],['2026-11-21','포항스틸러스','14:00','포항스틸야드','K리그1'],['2026-11-28','제주SKFC','14:00','안양종합운동장','K리그1'],
  ['2026-12-05','광주FC','14:00','안양종합운동장','K리그1']
].map(([date, opponent, time, venue, competition]) => ({ date, opponent, time, venue, competition }));
let matchCalendarMonth = new Date(2026, 10, 1);
let selectedMatchDate = '';
function renderMatchCalendars() {
  const visits = readMyVisits();
  document.querySelectorAll('[data-match-calendar]').forEach((calendar) => {
    calendar.replaceChildren();
    const year = matchCalendarMonth.getFullYear();
    const month = matchCalendarMonth.getMonth();
    const monthMatches = anyangMatches2026.filter((match) => {
      const date = new Date(`${match.date}T12:00:00`);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    const header = document.createElement('div');
    header.className = 'my-calendar-header';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.textContent = '‹'; previous.setAttribute('aria-label', '이전 달');
    previous.disabled = year === 2026 && month === 0;
    previous.addEventListener('click', () => { if (previous.disabled) return; matchCalendarMonth = new Date(year, month - 1, 1); selectedMatchDate = ''; renderMatchCalendars(); });
    const title = document.createElement('strong');
    title.textContent = `${year}년 ${month + 1}월`;
    const next = document.createElement('button');
    next.type = 'button'; next.textContent = '›'; next.setAttribute('aria-label', '다음 달');
    next.disabled = year === 2026 && month === 11;
    next.addEventListener('click', () => { if (next.disabled) return; matchCalendarMonth = new Date(year, month + 1, 1); selectedMatchDate = ''; renderMatchCalendars(); });
    header.append(previous, title, next);
    const count = document.createElement('p');
    count.className = 'my-calendar-count';
    count.textContent = `${monthMatches.length}경기 일정`;
    const grid = document.createElement('div');
    grid.className = 'my-match-stamp-grid';
    monthMatches.forEach((match) => {
      const attended = visits.some((visit) => visit.date === match.date);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `my-match-stamp${attended ? ' attended' : ''}${selectedMatchDate === match.date ? ' selected' : ''}`;
      cell.setAttribute('aria-label', `${match.date} ${match.opponent}${attended ? ', 직관 인증 완료' : ''}`);
      const crest = document.createElement('img');
      crest.src = 'https://tv.kleague.com/image/410x410/cf1d6330-63fc-45a5-aea9-d224dc3d6275.png?v=20250225103628';
      crest.alt = attended ? 'FC 안양 직관 인증 엠블럼 도장' : 'FC 안양 경기일 엠블럼';
      const date = document.createElement('strong');
      const [, matchMonth, matchDay] = match.date.split('-');
      date.textContent = `${Number(matchMonth)}월 ${Number(matchDay)}일`;
      const opponent = document.createElement('span');
      opponent.textContent = match.opponent;
      const status = document.createElement('small');
      status.textContent = attended ? '직관 인증' : match.date > getMyLocalDateKey() ? '경기 예정' : '인증 기록 없음';
      cell.append(crest, date, opponent, status);
      cell.addEventListener('click', () => { selectedMatchDate = match.date; renderMatchCalendars(); });
      grid.append(cell);
    });
    if (!monthMatches.length) {
      const empty = document.createElement('p');
      empty.className = 'my-match-stamp-empty';
      empty.textContent = '이번 달 예정된 FC 안양 경기가 없습니다.';
      grid.append(empty);
    }
    const legend = document.createElement('div'); legend.className = 'my-calendar-legend';
    legend.innerHTML = '<span><i class="scheduled"></i> 경기 일정</span><span><i class="checked"></i> 직관 인증 도장</span>';
    const detail = document.createElement('div'); detail.className = 'my-calendar-match-detail';
    const chosenMatch = anyangMatches2026.find((item) => item.date === selectedMatchDate);
    if (chosenMatch) {
      const checkedIn = visits.some((visit) => visit.date === chosenMatch.date);
      const matchup = chosenMatch.venue === '안양종합운동장' ? `FC 안양 vs ${chosenMatch.opponent}` : `${chosenMatch.opponent} vs FC 안양`;
      const statusLabel = checkedIn ? '직관 인증 완료' : chosenMatch.date > getMyLocalDateKey() ? '경기 예정' : '직관 인증 기록 없음';
      detail.innerHTML = `<strong>${chosenMatch.date} · ${matchup}</strong><span>${chosenMatch.time} · ${chosenMatch.venue} · ${chosenMatch.competition}</span><b class="${checkedIn ? 'is-checked' : ''}">${statusLabel}</b>`;
    } else detail.textContent = '경기 일정 도장을 눌러 경기 정보와 인증 내역을 확인하세요.';
    calendar.append(header, count, grid, legend, detail);
  });
}
function openMyView(viewName) {
  if (viewName !== 'membership') stopMembershipCamera();
  document.querySelectorAll('[data-my-view]').forEach((view) => { view.hidden = view.dataset.myView !== viewName; });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function readAuthUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null'); } catch { return null; }
}
function getDemoAccounts() {
  try { return JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]'); } catch { return []; }
}
function renderMyProfile() {
  const user = readAuthUser();
  const greeting = document.getElementById('myGreeting');
  const subline = document.getElementById('myProfileSubline');
  const anniversary = document.getElementById('myAnniversary');
  if (!user) {
    greeting.textContent = '로그인이 필요해요';
    subline.textContent = '로그인·회원가입하고 안양 팬 혜택을 만나보세요';
    anniversary.textContent = '로그인하고 바티·나리와 함께해요';
    return;
  }
  greeting.textContent = '안녕하세요, 바티 님';
  subline.textContent = user.email || user.phone || 'FC ANYANG · PURPLE MEMBER';
  const joined = new Date(user.joinedAt || Date.now());
  const today = new Date();
  joined.setHours(0,0,0,0); today.setHours(0,0,0,0);
  const days = Math.max(1, Math.floor((today - joined) / 86400000) + 1);
  anniversary.textContent = `바티·나리와 함께한 지 ${days}일째입니다`;
}
function showAuthScreen(mode = 'login') {
  const user = readAuthUser();
  document.getElementById('authScreen').hidden = false;
  document.getElementById('authFormView').hidden = Boolean(user);
  document.getElementById('authLoggedView').hidden = !user;
  document.getElementById('authLoggedName').textContent = '바티 님';
  document.getElementById('authLoggedMethod').textContent = user ? (user.email || user.phone || `${user.provider || 'FC 안양'} 계정`) : '';
  if (!user) setAuthMode(mode);
}
function setAuthMode(mode) {
  document.querySelectorAll('[data-auth-mode]').forEach((button) => button.classList.toggle('active', button.dataset.authMode === mode));
  document.getElementById('authLoginForm').hidden = mode !== 'login';
  document.getElementById('authSignupForm').hidden = mode !== 'signup';
}
function completeDemoLogin(account, notice = '로그인했어요.') {
  const user = { ...account, joinedAt: account.joinedAt || new Date().toISOString() };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  document.getElementById('authScreen').hidden = true;
  renderMyProfile();
  renderMembershipCard();
  showMessage(notice);
}
document.getElementById('myProfileButton').addEventListener('click', () => showAuthScreen());
document.getElementById('authBack').addEventListener('click', () => { document.getElementById('authScreen').hidden = true; });
document.getElementById('authClose').addEventListener('click', () => { document.getElementById('authScreen').hidden = true; });
document.querySelectorAll('[data-auth-mode]').forEach((button) => button.addEventListener('click', () => setAuthMode(button.dataset.authMode)));
document.querySelectorAll('input[name="signupType"]').forEach((radio) => radio.addEventListener('change', () => {
  const phoneMode = document.querySelector('input[name="signupType"]:checked').value === 'phone';
  const emailField = document.querySelector('.auth-email-field'); const phoneField = document.querySelector('.auth-phone-field');
  emailField.hidden = phoneMode; phoneField.hidden = !phoneMode;
  emailField.querySelector('input').required = !phoneMode; phoneField.querySelector('input').required = phoneMode;
}));
document.getElementById('authSignupForm').addEventListener('submit', (event) => {
  event.preventDefault(); if (!event.currentTarget.reportValidity()) return;
  const data = new FormData(event.currentTarget); const phoneMode = data.get('signupType') === 'phone';
  const account = { name: String(data.get('name')).trim(), email: phoneMode ? '' : String(data.get('email')).trim().toLowerCase(), phone: phoneMode ? String(data.get('phone')).trim() : '', joinedAt: new Date().toISOString(), provider: phoneMode ? '휴대폰' : '이메일' };
  const accounts = getDemoAccounts().filter((item) => account.email ? item.email !== account.email : item.phone !== account.phone);
  accounts.push(account); localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
  completeDemoLogin(account, '회원가입을 완료했어요. 바티·나리와 함께해요!'); event.currentTarget.reset();
});
document.getElementById('authLoginForm').addEventListener('submit', (event) => {
  event.preventDefault(); if (!event.currentTarget.reportValidity()) return;
  const email = String(new FormData(event.currentTarget).get('email')).trim().toLowerCase();
  const account = getDemoAccounts().find((item) => item.email === email);
  if (!account) { showMessage('등록된 계정이 없어요. 회원가입을 먼저 진행해주세요.'); return; }
  completeDemoLogin(account); event.currentTarget.reset();
});
document.querySelectorAll('[data-auth-social]').forEach((button) => button.addEventListener('click', () => {
  const provider = button.dataset.authSocial === 'naver' ? '네이버' : '카카오톡';
  const account = { name: '바티', email: '', phone: '', provider, joinedAt: new Date().toISOString() };
  completeDemoLogin(account, `${provider} 간편 로그인 시연을 완료했어요.`);
}));
document.getElementById('authLogout').addEventListener('click', () => {
  localStorage.removeItem(AUTH_USER_KEY); document.getElementById('authScreen').hidden = true; renderMyProfile(); renderMembershipCard(); showMessage('로그아웃했어요.');
});
function selectMyCheckinTab(tabName) {
  document.querySelectorAll('[data-my-tab]').forEach((tab) => {
    const active = tab.dataset.myTab === tabName;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-my-page]').forEach((page) => {
    const active = page.dataset.myPage === tabName;
    page.classList.toggle('active', active);
    page.hidden = !active;
  });
}
document.querySelectorAll('[data-my-open]').forEach((button) => button.addEventListener('click', () => {
  const viewName = button.dataset.myOpen;
  openMyView(viewName);
  if (viewName === 'activity') renderMyRecords();
  if (viewName === 'checkin') selectMyCheckinTab('verify');
  if (viewName === 'membership') prepareMembershipForm();
  if (viewName === 'tickets') renderMyBookings();
}));
document.querySelectorAll('[data-my-back]').forEach((button) => button.addEventListener('click', () => openMyView('home')));
document.querySelectorAll('[data-my-tab]').forEach((button) => button.addEventListener('click', () => {
  selectMyCheckinTab(button.dataset.myTab);
  if (button.dataset.myTab === 'history') renderMyRecords();
}));
document.querySelector('[data-my-tab-jump="verify"]').addEventListener('click', () => selectMyCheckinTab('verify'));
document.getElementById('mySettings').addEventListener('click', () => showMessage('회원 설정은 로그인 기능 연동 후 이용할 수 있어요.'));
renderMyProfile();
function renderMembershipCard() {
  const membership = readMembershipRegistration();
  const level = membership ? MEMBERSHIP_LEVELS[membership.type] : null;
  document.getElementById('myMembershipName').textContent = level?.name || '일반회원';
  document.getElementById('myMembershipLevel').textContent = level ? '멤버십 등록' : '미등록';
  const registerButton = document.getElementById('registerMembership');
  const pass = document.getElementById('mySeasonPass');
  registerButton.hidden = Boolean(level);
  pass.hidden = !level;
  if (level) {
    document.getElementById('seasonPassTier').textContent = level.name;
    document.getElementById('seasonPassOwner').textContent = `${readAuthUser()?.name || '바티'} 님`;
    document.getElementById('seasonPassSeat').textContent = membership.type === 'sukabati' && membership.seatInfo ? membership.seatInfo : level.label;
    document.getElementById('seasonPassCode').textContent = `MEMBER CARD · •••••••••${membership.barcode.slice(-4)}`;
  }
  document.getElementById('membershipCardPrompt').innerHTML = level
    ? `${level.label}<br>등록 완료 · 변경하려면 눌러주세요.`
    : '모바일 멤버십을 등록하고<br>회원 혜택을 확인해보세요!';
}
function prepareMembershipForm() {
  const membership = readMembershipRegistration();
  document.querySelectorAll('input[name="membershipType"]').forEach((input) => {
    input.checked = input.value === membership?.type;
  });
  document.getElementById('membershipBarcodeInput').value = membership?.barcode || '';
  document.getElementById('membershipSeatInput').value = membership?.seatInfo || '';
  document.getElementById('membershipSeatField').hidden = document.querySelector('input[name="membershipType"]:checked')?.value !== 'sukabati';
  const registered = document.getElementById('membershipRegistered');
  registered.hidden = !membership;
  if (membership) {
    const level = MEMBERSHIP_LEVELS[membership.type];
    registered.textContent = `${level?.name || '멤버십'} 등록됨 · 바코드 끝자리 ${membership.barcode.slice(-4)}`;
  }
}
document.getElementById('registerMembership').addEventListener('click', () => {
  openMyView('membership');
  prepareMembershipForm();
});
document.getElementById('scoreHelp').addEventListener('click', () => showMessage('멤버십 등급, 직관, FANZONE, MATCH CHAT, 승부예측, 출석체크 점수를 합산합니다.'));
document.getElementById('membershipBarcodeInput').addEventListener('input', (event) => {
  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 13);
});
document.querySelectorAll('input[name="membershipType"]').forEach((input) => input.addEventListener('change', () => {
  document.getElementById('membershipSeatField').hidden = input.value !== 'sukabati';
}));
document.getElementById('membershipForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const selectedType = document.querySelector('input[name="membershipType"]:checked')?.value;
  const barcode = document.getElementById('membershipBarcodeInput').value.trim();
  const seatInfo = selectedType === 'sukabati' ? document.getElementById('membershipSeatInput').value.trim() : '';
  const status = document.getElementById('membershipCodeStatus');
  if (!selectedType) { showMessage('멤버십 등급을 먼저 선택해주세요.'); return; }
  if (!/^\d{13}$/.test(barcode)) {
    status.textContent = '바코드 아래 13자리 숫자를 정확히 입력해주세요.';
    document.getElementById('membershipBarcodeInput').focus();
    return;
  }
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify({ type: selectedType, barcode, seatInfo, registeredAt: new Date().toISOString() }));
  status.textContent = '멤버십 정보가 이 기기에 저장되었습니다.';
  renderMembershipCard();
  prepareMembershipForm();
  renderMyRecords();
  showMessage(`${MEMBERSHIP_LEVELS[selectedType].name} 멤버십을 등록했어요.`);
});
renderMembershipCard();
function renderFanzonePosts() {
  const list = document.getElementById('communityPostList');
  if (!list) return;
  list.replaceChildren();
  const posts = readFanzonePosts();
  if (!posts.length) {
    const sample = document.createElement('article');
    sample.className = 'community-post';
    const title = document.createElement('b'); title.textContent = '오늘도 보라색으로 물들 안양!';
    const body = document.createElement('p'); body.textContent = '다음 홈 경기에서 함께 응원해요. 우리 모두의 목소리로 승리를 만들어요 💜';
    sample.append(title, body); list.append(sample); return;
  }
  [...posts].reverse().forEach((post) => {
    const article = document.createElement('article'); article.className = 'community-post';
    const title = document.createElement('b'); title.textContent = '안양 팬';
    const body = document.createElement('p'); body.textContent = post.text;
    const date = document.createElement('small'); date.textContent = post.date;
    article.append(title, body, date); list.append(article);
  });
}
document.getElementById('communityPostForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('communityPostInput');
  const text = input.value.trim();
  if (!text) { showMessage('응원 글을 입력해주세요.'); return; }
  const posts = readFanzonePosts();
  posts.push({ text, date: new Date().toLocaleDateString('ko-KR') });
  localStorage.setItem(FANZONE_KEY, JSON.stringify(posts.slice(-100)));
  input.value = '';
  document.getElementById('communityPostForm').hidden = true;
  renderFanzonePosts();
  renderMyRecords();
  showMessage('FANZONE에 응원 글을 남겼어요.');
});
let myCameraStream = null;
let myScanFrame = 0;
let pendingMyScanCode = '';
function getMyLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function stopMyCamera() {
  if (myScanFrame) cancelAnimationFrame(myScanFrame);
  myScanFrame = 0;
  if (myCameraStream) myCameraStream.getTracks().forEach((track) => track.stop());
  myCameraStream = null;
  document.getElementById('myScanVideo').srcObject = null;
  document.getElementById('myScanner').hidden = true;
}
let membershipCameraStream = null;
let membershipScanFrame = 0;
function stopMembershipCamera() {
  if (membershipScanFrame) cancelAnimationFrame(membershipScanFrame);
  membershipScanFrame = 0;
  if (membershipCameraStream) membershipCameraStream.getTracks().forEach((track) => track.stop());
  membershipCameraStream = null;
  const video = document.getElementById('membershipScanVideo');
  if (video) video.srcObject = null;
  const scanner = document.getElementById('membershipScanner');
  if (scanner) scanner.hidden = true;
}
async function startMembershipCamera() {
  const scanner = document.getElementById('membershipScanner');
  const status = document.getElementById('membershipScanStatus');
  scanner.hidden = false;
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
    status.textContent = '카메라 바코드 스캔을 지원하지 않는 브라우저입니다. 아래 칸에 13자리 번호를 입력해주세요.';
    document.getElementById('membershipBarcodeInput').focus();
    return;
  }
  try {
    const detector = new BarcodeDetector({ formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code'] });
    membershipCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    const video = document.getElementById('membershipScanVideo');
    video.srcObject = membershipCameraStream;
    await video.play();
    status.textContent = '시즌권 후면 바코드를 화면에 맞춰주세요.';
    const scan = async () => {
      if (!membershipCameraStream || video.readyState < 2) { membershipScanFrame = requestAnimationFrame(scan); return; }
      try {
        const codes = await detector.detect(video);
        if (codes.length && codes[0].rawValue) {
          const digits = codes[0].rawValue.replace(/\D/g, '');
          stopMembershipCamera();
          if (digits.length !== 13) {
            document.getElementById('membershipScanStatus').textContent = '인식한 값이 13자리가 아닙니다. 바코드 아래 번호를 직접 입력해주세요.';
            document.getElementById('membershipScanner').hidden = false;
            return;
          }
          document.getElementById('membershipBarcodeInput').value = digits;
          document.getElementById('membershipCodeStatus').textContent = '바코드를 읽었습니다. 멤버십 종류를 확인하고 등록해주세요.';
          showMessage('시즌권 바코드를 읽었습니다.');
          return;
        }
      } catch { status.textContent = '바코드를 찾는 중입니다. 카드와 카메라 거리를 조정해주세요.'; }
      membershipScanFrame = requestAnimationFrame(scan);
    };
    membershipScanFrame = requestAnimationFrame(scan);
  } catch {
    status.textContent = '카메라를 열 수 없습니다. 카메라 권한을 확인하거나 13자리 번호를 직접 입력해주세요.';
  }
}
document.getElementById('startMembershipScan').addEventListener('click', startMembershipCamera);
document.getElementById('stopMembershipScan').addEventListener('click', stopMembershipCamera);
async function startMyCamera() {
  const scanner = document.getElementById('myScanner');
  const status = document.getElementById('myScanStatus');
  scanner.hidden = false;
  document.getElementById('myResultEntry').hidden = true;
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
    status.textContent = '이 브라우저에서 카메라 QR 스캔을 지원하지 않아요. 최신 Chrome 또는 Edge에서 다시 시도해주세요.';
    return;
  }
  try {
    const detector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8'] });
    myCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    const video = document.getElementById('myScanVideo');
    video.srcObject = myCameraStream;
    await video.play();
    status.textContent = '회원 바코드 또는 실물 티켓 QR을 화면 안에 맞춰주세요.';
    const scan = async () => {
      if (!myCameraStream || video.readyState < 2) { myScanFrame = requestAnimationFrame(scan); return; }
      try {
        const codes = await detector.detect(video);
        if (codes.length && codes[0].rawValue) {
          pendingMyScanCode = codes[0].rawValue;
          stopMyCamera();
          const visits = readMyVisits();
          if (visits.some((visit) => visit.date === getMyLocalDateKey())) {
            showMessage('오늘 직관 기록이 이미 있어요.');
            return;
          }
          document.getElementById('myScannedCodeLabel').textContent = '코드 스캔 완료 · 오늘 경기 결과 선택';
          document.getElementById('myResultEntry').hidden = false;
          return;
        }
      } catch { status.textContent = '코드를 찾는 중이에요. 카메라를 티켓에 가까이 맞춰주세요.'; }
      myScanFrame = requestAnimationFrame(scan);
    };
    myScanFrame = requestAnimationFrame(scan);
  } catch {
    status.textContent = '카메라를 열 수 없어요. 브라우저의 카메라 권한과 HTTPS 연결을 확인해주세요.';
  }
}
document.getElementById('startMyScan').addEventListener('click', startMyCamera);
document.getElementById('stopMyScan').addEventListener('click', stopMyCamera);
document.querySelectorAll('[data-my-outcome]').forEach((button) => button.addEventListener('click', () => {
  const date = new Date();
  const dateKey = getMyLocalDateKey(date);
  const visits = readMyVisits();
  if (visits.some((visit) => visit.date === dateKey)) {
    showMessage('오늘 직관 기록이 이미 있어요.');
    document.getElementById('myResultEntry').hidden = true;
    return;
  }
  visits.push({ date: dateKey, dateLabel: date.toLocaleDateString('ko-KR'), outcome: button.dataset.myOutcome, codeSuffix: pendingMyScanCode.slice(-4) });
  localStorage.setItem(MY_VISITS_KEY, JSON.stringify(visits));
  pendingMyScanCode = '';
  document.getElementById('myResultEntry').hidden = true;
  renderMyRecords();
  showMessage('직관 기록을 저장했어요! 엠블럼 도장을 확인해보세요.');
}));
document.getElementById('shareMyRecord').addEventListener('click', async () => {
  const visits = readMyVisits();
  const wins = visits.filter((visit) => visit.outcome === 'win').length;
  const rate = visits.length ? Math.round((wins / visits.length) * 100) : 0;
  const shareText = `나의 FC 안양 직관 기록 💜 ${visits.length}회 직관 · ${wins}승 · 직관 승률 ${visits.length ? `${rate}%` : '기록 없음'} | OUR CHALLENGE GOES ON`;
  if (navigator.share) {
    try { await navigator.share({ title: '나의 FC 안양 직관 기록', text: shareText }); }
    catch (error) { if (error.name !== 'AbortError') showMessage('공유를 완료하지 못했어요.'); }
  } else if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(shareText); showMessage('직관 기록을 클립보드에 복사했어요.'); }
    catch { showMessage(shareText); }
  } else showMessage(shareText);
});
const eventViewport = document.getElementById('eventViewport');
const eventSlides = [...eventViewport.querySelectorAll('.event-slide')];
const eventDots = [...document.querySelectorAll('[data-carousel-dot]')];
let activeEventPage = 0;
function goToEventPage(page) {
  activeEventPage = Math.max(0, Math.min(eventSlides.length - 1, page));
  eventViewport.scrollTo({ left: eventSlides[activeEventPage].offsetLeft - eventViewport.offsetLeft, behavior: 'smooth' });
  updateEventPagination();
}
function updateEventPagination() {
  eventDots.forEach((dot, index) => {
    const active = index === activeEventPage;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'page' : 'false');
  });
}
document.querySelector('[data-carousel-prev]').addEventListener('click', () => goToEventPage(activeEventPage - 1));
document.querySelector('[data-carousel-next]').addEventListener('click', () => goToEventPage(activeEventPage + 1));
eventDots.forEach((dot) => dot.addEventListener('click', () => goToEventPage(Number(dot.dataset.carouselDot))));
let scrollFrame = 0;
eventViewport.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    activeEventPage = Math.round(eventViewport.scrollLeft / eventViewport.clientWidth);
    updateEventPagination();
  });
});



