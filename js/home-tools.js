(() => {
  const dialogs = `
    <section class="home-tool-dialog" id="lineupModal" role="dialog" aria-modal="true" aria-labelledby="lineupTitle" hidden>
      <button class="home-tool-backdrop" data-tool-close="lineupModal" aria-label="닫기"></button>
      <div class="lineup-sheet"><header class="home-tool-header"><div><small>FC ANYANG · 2026 SEASON</small><h2 id="lineupTitle">출전 명단</h2></div><button type="button" class="home-tool-close" data-tool-close="lineupModal" aria-label="출전 명단 닫기">×</button></header>
        <div class="lineup-poster"><div class="lineup-poster-mark">FC<br>ANYANG</div><div class="lineup-poster-title"><small>NEXT MATCH · 11.07 SAT 16:30</small><h3>LINEUP</h3><p>김천 상무 vs FC 안양</p><span>선발 명단 예시 · 공식 발표 전</span></div>
          <div class="lineup-pitch" aria-label="FC 안양 예상 출전 선수"><div class="lineup-row">${[['11','아일톤','FW','20260091'],['9','엘쿠라노','FW','20260090'],['7','마테우스','MF','20230138']].map(lineupPlayer).join('')}</div><div class="lineup-row">${[['8','김정현','MF','20160073'],['13','한가람','MF','20240080'],['26','이진용','MF','20200084'],['6','강지완','MF','20260089']].map(lineupPlayer).join('')}</div><div class="lineup-row">${[['3','김지훈','DF','20250084'],['4','이창용','DF','20130191'],['21','권경원','DF','20130102']].map(lineupPlayer).join('')}</div><div class="lineup-row goalkeeper">${lineupPlayer(['31','김다솔','GK','20100031'])}</div></div>
          <div class="lineup-bench"><b>교체 명단</b><span>김정훈 · 김영찬 · 문성우 · 박정훈 · 최건주 · 김운</span></div>
        </div><p class="lineup-footnote">경기별 최종 출전 명단은 구단 공식 발표를 기준으로 업데이트됩니다.</p>
      </div>
    </section>
    <section class="home-tool-dialog" id="stadiumGuideModal" role="dialog" aria-modal="true" aria-labelledby="stadiumGuideTitle" hidden>
      <button class="home-tool-backdrop" data-tool-close="stadiumGuideModal" aria-label="닫기"></button>
      <div class="home-tool-sheet"><header class="home-tool-header"><div><small>ANYANG SPORTS COMPLEX</small><h2 id="stadiumGuideTitle">경기장 안내</h2></div><button type="button" class="home-tool-close" data-tool-close="stadiumGuideModal" aria-label="경기장 안내 닫기">×</button></header>
        <p class="stadium-address">경기도 안양시 동안구 평촌대로 389<br><b>안양종합운동장</b></p>
        <article class="stadium-guide-card"><span>🚘 주차 요금</span><strong>첫 60분 무료</strong><p>이후 10분당 300원 · 10분 미만도 10분으로 계산<br>운영 08:00–21:00 · 카드 전용(현금 결제 불가)<br>경기일에는 혼잡할 수 있으니 대중교통 이용을 권장합니다.</p></article>
        <article class="stadium-guide-card"><span>🚇 범계역에서</span><strong>4호선 범계역 3번 출구</strong><p>선경아파트 앞에서 마을버스 5번 탑승 → 종합운동장 정문 하차 (약 20분)<br>롯데백화점 앞에서 일반버스 60번 → 종합운동장 하차 (약 20분)</p></article>
        <article class="stadium-guide-card"><span>🚉 안양역에서</span><strong>1호선 안양역 1번 출구</strong><p>맞은편 교보생명 앞 정류장에서 5625·5626·5713번 탑승 → 종합운동장 정문 하차 (약 25분)</p></article>
        <article class="stadium-guide-card"><span>🚏 인덕원역에서</span><strong>4호선 인덕원역 8번 출구</strong><p>인덕원역 정류장에서 11-2·11-3·51·60-1·8·8-1번 또는 간선 541번 이용</p></article>
        <a class="stadium-official-link" href="https://www.fc-anyang.com/club/complex.asp" target="_blank" rel="noopener">구단 공식 경기장 안내 ↗</a>
      </div>
    </section>
    <section class="home-tool-dialog" id="foodOrderModal" role="dialog" aria-modal="true" aria-labelledby="foodOrderTitle" hidden>
      <button class="home-tool-backdrop" data-tool-close="foodOrderModal" aria-label="닫기"></button>
      <div class="home-tool-sheet food-order-sheet"><header class="home-tool-header"><div><small>FC ANYANG · MATCHDAY</small><h2 id="foodOrderTitle">푸드트럭 퀵오더</h2></div><button type="button" class="home-tool-close" data-tool-close="foodOrderModal" aria-label="퀵오더 닫기">×</button></header>
        <p class="food-order-intro">전광판이나 경기장 곳곳의 퀵오더 QR을 스캔하고, 좌석에서 주문한 뒤 픽업 알림을 받으면 찾아가세요.</p>
        <button type="button" class="food-qr-button" id="foodQrStart">▦ 푸드트럭 QR 스캔</button><div class="food-scanner" id="foodScanner" hidden><video id="foodQrVideo" playsinline muted></video><p id="foodQrMessage">QR 코드를 화면 안에 맞춰주세요.</p><button type="button" id="foodQrStop">카메라 닫기</button></div>
        <label class="food-vendor-label" for="foodTruckCode">픽업 푸드트럭 코드 <small>QR 인식이 안 되면 코드를 직접 입력하세요.</small></label><input id="foodTruckCode" class="food-truck-code" placeholder="예: ANYANG-FOOD-01" autocomplete="off">
        <p class="food-price-note">메뉴와 가격은 퀵오더 화면 구성을 위한 예시이며, 실제 입점·가격은 경기별 안내를 따릅니다.</p><div class="food-order-list">${[['회오리감자','6,000'],['닭강정','8,000'],['소고기초밥','12,000'],['바닐라라떼','5,000'],['미국식 바비큐','13,000'],['직화삼겹말이','9,000'],['피자','10,000'],['닭꼬치','5,000']].map(([name,price])=>`<article class="food-menu-item"><div><b>${name}</b><small>예시 ${price}원</small></div><button type="button" data-food-add="${name}" aria-label="${name} 담기">＋</button><span data-food-quantity="${name}">0</span></article>`).join('')}</div>
        <div class="food-order-total"><span>주문 금액</span><b id="foodOrderTotal">0원</b></div><button type="button" class="food-submit-button" id="foodOrderSubmit">주문하기</button><p class="food-order-status" id="foodOrderStatus" aria-live="polite">결제·실시간 푸드트럭 연동 전 시연 화면입니다.</p>
      </div>
    </section>`;
  function lineupPlayer([number, name, position, image]) {
    const url = image === '20090075' ? 'https://d2tfp74nsbbrkr.cloudfront.net/v1/player/player_20090075.jpg' : `https://d2tfp74nsbbrkr.cloudfront.net/v1/player/2026/K27/player_${image}.png`;
    return `<article class="lineup-player"><div class="lineup-player-photo"><span>${number}</span><img loading="lazy" src="${url}" alt="${name}" onerror="this.hidden=true"></div><b>${name}</b><small>${position}</small></article>`;
  }
  document.body.insertAdjacentHTML('beforeend', dialogs);
  const modals = [...document.querySelectorAll('.home-tool-dialog')];
  let stream = null;
  const basket = new Map();
  const prices = {'회오리감자':6000,'닭강정':8000,'소고기초밥':12000,'바닐라라떼':5000,'미국식 바비큐':13000,'직화삼겹말이':9000,'피자':10000,'닭꼬치':5000};
  function open(id) { const modal=document.getElementById(id); if(modal){modal.hidden=false;modal.querySelector('.home-tool-close')?.focus();document.body.classList.add('tool-dialog-open');} }
  function close(modal) { modal.hidden=true; if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;} modal.querySelector('video')?.removeAttribute('srcObject'); if(modals.every(item=>item.hidden))document.body.classList.remove('tool-dialog-open'); }
  document.addEventListener('click', event => {
    const shortcut=event.target.closest('[data-home-shortcut]');
    if(shortcut){const kind=shortcut.dataset.homeShortcut;if(kind==='lineup')open('lineupModal');if(kind==='stadium')open('stadiumGuideModal');if(kind==='food')open('foodOrderModal');}
    const closeButton=event.target.closest('[data-tool-close]');if(closeButton){const modal=document.getElementById(closeButton.dataset.toolClose);if(modal)close(modal);}
    if(event.target.classList.contains('home-tool-backdrop'))close(event.target.closest('.home-tool-dialog'));
    const candidate=event.target.closest('[data-mom-vote]');if(candidate){document.querySelectorAll('[data-mom-vote]').forEach(item=>item.classList.toggle('selected',item===candidate));}
    const add=event.target.closest('[data-food-add]');if(add){const name=add.dataset.foodAdd;basket.set(name,(basket.get(name)||0)+1);renderBasket();}
  });
  document.addEventListener('change', event=>{if(event.target.id==='momMatchSelect'){document.querySelectorAll('[data-mom-match-panel]').forEach(panel=>panel.hidden=panel.dataset.momMatchPanel!==event.target.value);document.querySelectorAll('[data-mom-vote]').forEach(item=>item.classList.remove('selected'));}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')modals.filter(modal=>!modal.hidden).forEach(close);});
  function renderBasket(){let total=0;Object.entries(prices).forEach(([name,price])=>{const count=basket.get(name)||0;const item=document.querySelector(`[data-food-quantity="${name}"]`);if(item)item.textContent=count;total+=count*price;});document.getElementById('foodOrderTotal').textContent=`${total.toLocaleString('ko-KR')}원`;}
  const video=document.getElementById('foodQrVideo');
  document.getElementById('foodQrStart').addEventListener('click',async()=>{
    const message=document.getElementById('foodQrMessage');
    if(!('BarcodeDetector'in window)){document.getElementById('foodScanner').hidden=false;message.textContent='이 브라우저에서는 카메라 QR 인식을 지원하지 않습니다. 푸드트럭 코드를 직접 입력해 주세요.';return;}
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});video.srcObject=stream;await video.play();document.getElementById('foodScanner').hidden=false;const detector=new BarcodeDetector({formats:['qr_code']});const scan=async()=>{if(!stream)return;try{const codes=await detector.detect(video);if(codes.length){document.getElementById('foodTruckCode').value=codes[0].rawValue;message.textContent='푸드트럭 QR 확인 완료! 메뉴를 골라주세요.';stream.getTracks().forEach(track=>track.stop());stream=null;return;}}catch{}setTimeout(scan,350);};scan();}catch{document.getElementById('foodScanner').hidden=false;message.textContent='카메라 권한을 사용할 수 없어요. QR 아래의 푸드트럭 코드를 입력해 주세요.';}
  });
  document.getElementById('foodQrStop').addEventListener('click',()=>{if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;}document.getElementById('foodScanner').hidden=true;});
  document.getElementById('foodOrderSubmit').addEventListener('click',()=>{
    const total=Object.entries(prices).reduce((sum,[name,price])=>sum+(basket.get(name)||0)*price,0);const code=document.getElementById('foodTruckCode').value.trim();const status=document.getElementById('foodOrderStatus');
    if(!code){status.textContent='먼저 푸드트럭 QR을 스캔하거나 픽업 코드를 입력해 주세요.';return;}if(!total){status.textContent='주문할 메뉴를 먼저 담아주세요.';return;}
    const orderNo=`AY-${Math.floor(1000+Math.random()*9000)}`;status.innerHTML=`<b>${orderNo} 주문 접수 · ${code}</b><br>주문이 준비되면 이 화면에 픽업 알림이 표시됩니다.`;document.getElementById('foodOrderSubmit').disabled=true;
    window.setTimeout(()=>{status.innerHTML=`<b>🔔 픽업 알림 · ${orderNo}</b><br>주문하신 메뉴를 픽업 장소에서 받아가세요.`;status.classList.add('ready');window.showMessage?.(`주문 ${orderNo} 픽업 준비 완료! 푸드트럭에서 받아가세요.`);document.getElementById('foodOrderSubmit').disabled=false;},12000);
  });
  modals.forEach(modal=>modal.addEventListener('close',()=>close(modal)));
})();
