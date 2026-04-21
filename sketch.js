let capture;
let pg; // 宣告繪圖層變數
let bubbles = []; // 存放泡泡數據的陣列
let bows = [];    // 存放蝴蝶結數據
let hearts = [];  // 存放愛心數據
let filterMode = 0; // 0: 泡泡, 1: 蝴蝶結, 2: 愛心
let flashAlpha = 0; // 閃光燈透明度
let btnFlash, btnFilter, btnSave; // 按鈕變數

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML 視訊元件，避免在畫布下方重複顯示
  capture.hide();

  // 1. 初始化尺寸：計算手機比例 (9:16) 的尺寸，確保符合畫布 60-70% 的限制
  let vH = windowHeight * 0.7;
  let vW = vH * (9 / 16);
  if (vW > windowWidth * 0.6) {
    vW = windowWidth * 0.6;
    vH = vW * (16 / 9);
  }
  pg = createGraphics(vW, vH);

  // 初始化三種濾鏡的粒子數據
  for (let i = 0; i < 40; i++) {
    // 泡泡
    bubbles.push({
      x: random(pg.width),
      y: random(pg.height),
      r: random(4, 12),
      speed: random(1, 3)
    });
    // 蝴蝶結
    bows.push({
      x: random(pg.width),
      y: random(pg.height),
      size: random(0.4, 0.8),
      speed: random(0.5, 1.5),
      sway: random(0.02, 0.05)
    });
    // 愛心
    hearts.push({
      x: random(pg.width),
      y: random(pg.height),
      size: random(15, 30),
      speed: random(1, 2),
      sway: random(0.03, 0.08)
    });
  }

  // 建立按鈕
  btnFlash = createButton('閃光');
  btnFlash.class('p5-button btn-flash');
  btnFlash.mousePressed(() => flashAlpha = 255);
  
  btnFilter = createButton('切換濾鏡');
  btnFilter.class('p5-button btn-filter');
  btnFilter.mousePressed(() => filterMode = (filterMode + 1) % 3);
  
  btnSave = createButton('儲存圖片');
  btnSave.class('p5-button btn-save');
  btnSave.mousePressed(() => saveCanvas('my_snapshot', 'png'));

  updateButtonPositions();
}

function updateButtonPositions() {
  // 計算按鈕位置，置於手機畫面正下方
  let vH = height * 0.7;
  let y = (height - vH) / 2;
  btnFlash.position(width / 2 - 110, y + vH + 20);
  btnFilter.position(width / 2 - 40, y + vH + 20);
  btnSave.position(width / 2 + 50, y + vH + 20);
}

function draw() {
  // 3. 設定畫布背景顏色為 e7c6ff
  background('#e7c6ff');

  // 4. 即時計算影像顯示的大小 (維持手機比例 9:16)
  let vH = height * 0.7;
  let vW = vH * (9 / 16);
  if (vW > width * 0.6) {
    vW = width * 0.6;
    vH = vW * (16 / 9);
  }

  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 5. & 6. 將攝影機影像繪製在畫布正中間，並修正左右顛倒
  push(); // 儲存目前的繪圖狀態
  translate(width, 0); // 將座標原點移至畫布右側
  scale(-1, 1);        // 水平翻轉座標系 (x 軸變為反向)
  
  // 為了不讓影像在直向手機比例下變形，計算攝像頭來源的裁剪範圍 (sx, sy, sw, sh)
  let cw = capture.width;
  let ch = capture.height;
  let videoRatio = cw / ch;
  let targetRatio = vW / vH;
  let sx, sy, sw, sh;

  if (videoRatio > targetRatio) {
    sw = ch * targetRatio;
    sh = ch;
    sx = (cw - sw) / 2;
    sy = 0;
  } else {
    sw = cw;
    sh = cw / targetRatio;
    sx = 0;
    sy = (ch - sh) / 2;
  }

  // 繪製裁剪後的影像到計算好的置中位置
  image(capture, x, y, vW, vH, sx, sy, sw, sh);
  pop();  // 還原繪圖狀態，避免影響到其他可能要繪製的圖形

  // 在繪圖層 (pg) 上繪製內容 (範例：畫出一個紅色外框與文字)
  pg.clear(); // 確保背景透明，只顯示畫上去的內容

  // 根據 filterMode 切換不同的濾鏡效果
  if (filterMode === 0) {
    // 濾鏡 0: 玻璃泡泡
    for (let b of bubbles) {
      pg.fill(255, 255, 255, 40);
      pg.stroke(255, 255, 255, 120);
      pg.strokeWeight(0.5);
      pg.circle(b.x, b.y, b.r * 2);
      pg.noStroke();
      pg.fill(255, 255, 255, 220);
      pg.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.4, b.r * 0.6, b.r * 0.4);
      pg.fill(255, 255, 255, 60);
      pg.ellipse(b.x + b.r * 0.3, b.y + b.r * 0.3, b.r * 0.4, b.r * 0.4);
      b.y -= b.speed;
      b.x += sin(frameCount * 0.05 + b.r) * 0.5;
      if (b.y < -b.r * 2) { b.y = pg.height + b.r * 2; b.x = random(pg.width); }
    }
  } else if (filterMode === 1) {
    // 濾鏡 1: 緞帶蝴蝶結 (動態飄動)
    for (let bw of bows) {
      drawRibbonBow(pg, bw.x, bw.y, bw.size);
      bw.y -= bw.speed;
      bw.x += sin(frameCount * bw.sway) * 0.8;
      if (bw.y < -50) { bw.y = pg.height + 50; bw.x = random(pg.width); }
    }
  } else if (filterMode === 2) {
    // 濾鏡 2: 立體愛心 (動態飄動)
    for (let h of hearts) {
      draw3DHeart(pg, h.x, h.y, h.size);
      h.y -= h.speed;
      h.x += cos(frameCount * h.sway) * 1.2;
      if (h.y < -h.size) { h.y = pg.height + h.size; h.x = random(pg.width); }
    }
  }

  // 將此繪圖層顯示在視訊畫面的上方 (疊加在畫布中間)
  image(pg, x, y, vW, vH);

  // 繪製閃光燈效果：當按下閃光鈕，產生一個瞬間的白色覆蓋層並淡出
  if (flashAlpha > 0) {
    noStroke();
    fill(255, 255, 255, flashAlpha);
    rect(0, 0, width, height);
    flashAlpha -= 15; // 逐漸淡出速度
  }
}

// 繪製立體愛心的輔助函式
function draw3DHeart(p, x, y, size) {
  p.push();
  p.translate(x, y);
  p.noStroke();
  
  // 1. 底層極淺紫色玻璃光澤與細緻輪廓
  p.stroke(255, 255, 255, 100);
  p.strokeWeight(0.5);
  p.fill(230, 210, 255, 80);
  renderHeartShape(p, size * 1.1);

  // 2. 中層折射感 (內部微光)
  p.push();
  p.noStroke();
  p.translate(0, -size * 0.1);
  p.fill(245, 235, 255, 150);
  renderHeartShape(p, size * 0.9);
  p.pop();
  
  // 3. 銳利玻璃高光
  p.noStroke();
  p.fill(255, 255, 255, 200);
  p.ellipse(-size * 0.3, -size * 0.3, size * 0.5, size * 0.25);
  
  // 底部微弱反光
  p.fill(255, 255, 255, 60);
  p.ellipse(size * 0.1, size * 0.3, size * 0.3, size * 0.15);
  p.pop();
}

function renderHeartShape(p, size) {
  p.beginShape();
  p.vertex(0, 0);
  // 調整貝茲曲線參數，讓愛心變得更寬飽滿
  p.bezierVertex(-size * 0.7, -size * 0.6, -size * 1.4, size * 0.4, 0, size);
  p.bezierVertex(size * 1.4, size * 0.4, size * 0.7, -size * 0.6, 0, 0);
  p.endShape(CLOSE);
}

// 繪製緞帶蝴蝶結的輔助函式
function drawRibbonBow(p, x, y, s) {
  p.push();
  p.translate(x, y);
  p.scale(s);

  // 極淡紫色玻璃感配色
  let glassColor = color(243, 229, 245, 120); // 非常淡的紫色
  let highlightColor = color(255, 255, 255, 200);
  let edgeColor = color(224, 170, 255, 150);

  // 1. 繪製蝴蝶結兩側的透明玻璃球體環
  p.stroke(edgeColor);
  p.strokeWeight(0.5);
  p.fill(glassColor);
  p.beginShape();
  p.vertex(0, 0);
  p.bezierVertex(-60, -60, -80, 40, 0, 0); // 左側飽滿感
  p.bezierVertex(60, -60, 80, 40, 0, 0);  // 右側飽滿感
  p.endShape(CLOSE);

  // 2. 移除原本的緞帶尾巴，改用對稱的玻璃垂墜片 (不生硬的玻璃感)
  p.beginShape();
  p.vertex(-5, 5);
  p.bezierVertex(-20, 10, -35, 30, -30, 50);
  p.bezierVertex(-20, 45, -5, 20, -5, 5);
  p.vertex(5, 5);
  p.bezierVertex(20, 10, 35, 30, 30, 50);
  p.bezierVertex(20, 45, 5, 20, 5, 5);
  p.endShape(CLOSE);

  // 3. 頂層高光與亮點 (增加精緻度)
  p.noStroke();
  p.fill(highlightColor);
  p.ellipse(-35, -25, 25, 12); // 左高光
  p.ellipse(35, -25, 25, 12);  // 右高光
  p.circle(0, -5, 10);        // 中心微光
  
  // 4. 中間圓潤結點
  p.fill(edgeColor);
  p.ellipse(0, 0, 20, 18);
  p.pop();
}

function windowResized() {
  // 確保視窗大小改變時，畫布依然保持全螢幕
  resizeCanvas(windowWidth, windowHeight);
  // 同步更新繪圖層的大小，重新維持手機比例
  let vH = windowHeight * 0.7;
  let vW = vH * (9 / 16);
  if (vW > windowWidth * 0.6) {
    vW = windowWidth * 0.6;
    vH = vW * (16 / 9);
  }
  pg.resizeCanvas(vW, vH);
  updateButtonPositions();
}
