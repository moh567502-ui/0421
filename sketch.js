let capture;
let pg; // 宣告繪圖層變數
let snowflakes = []; // 存放雪花數據的陣列
let bubbles = [];   // 存放泡泡數據的陣列
let hearts = [];  // 存放愛心數據
let filterMode = 0; // 0: 泡泡, 1: 雪花, 2: 愛心
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
  for (let i = 0; i < 25; i++) {
    // 雪花 (取代原本的泡泡)
    snowflakes.push({
      x: random(pg.width),
      y: random(pg.height),
      size: random(10, 22),
      speed: random(0.8, 2),
      angle: random(TWO_PI),
      spin: random(-0.02, 0.02)
    });
  }

  // 初始化泡泡數據
  for (let i = 0; i < 30; i++) {
    bubbles.push({
      x: random(pg.width),
      y: random(pg.height),
      r: random(5, 15),
      speed: random(1, 2.5)
    });
  }

  // 初始化愛心數據 (數量減少)
  for (let i = 0; i < 15; i++) {
    hearts.push({
      x: random(pg.width),
      y: random(pg.height),
      size: random(18, 32),
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
    // 濾鏡 0: 立體玻璃泡泡 (向上飄動)
    for (let b of bubbles) {
      drawGlassBubble(pg, b.x, b.y, b.r);
      b.y -= b.speed;
      b.x += sin(frameCount * 0.03 + b.r) * 0.5;
      if (b.y < -b.r * 2) { 
        b.y = pg.height + b.r * 2; 
        b.x = random(pg.width); 
      }
    }
  } else if (filterMode === 1) {
    // 濾鏡 1: 立體玻璃雪花 (向下飄落) - 取代蝴蝶結
    for (let s of snowflakes) {
      drawGlassSnowflake(pg, s.x, s.y, s.size, s.angle);
      s.y += s.speed;
      s.angle += s.spin;
      s.x += sin(frameCount * 0.02 + s.size) * 0.5;
      if (s.y > pg.height + s.size) { 
        s.y = -s.size; 
        s.x = random(pg.width); 
      }
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

// 繪製立體玻璃雪花的輔助函式
function drawGlassSnowflake(p, x, y, size, angle) {
  p.push();
  p.translate(x, y);
  p.rotate(angle);
  
  // 玻璃主體：半透明白色描邊
  p.stroke(255, 255, 255, 110);
  p.strokeWeight(size * 0.08);
  p.noFill();
  
  for (let i = 0; i < 6; i++) {
    p.rotate(PI / 3);
    // 雪花主幹
    p.line(0, 0, 0, -size);
    // 雪花分支
    p.line(0, -size * 0.5, -size * 0.3, -size * 0.7);
    p.line(0, -size * 0.5, size * 0.3, -size * 0.7);
    
    // 3D 高光效果 (側邊亮線)
    p.stroke(255, 255, 255, 200);
    p.strokeWeight(size * 0.02);
    p.line(size * 0.04, -size * 0.1, size * 0.04, -size * 0.9);
  }
  
  // 中心亮點點綴
  p.noStroke();
  p.fill(255, 255, 255, 180);
  p.circle(0, 0, size * 0.2);
  p.pop();
}

// 繪製立體愛心的輔助函式
function draw3DHeart(p, x, y, size) {
  p.push();
  p.translate(x, y);
  p.noStroke();
  
  // 1. 底層透亮粉紫色玻璃光澤 (不描框)
  p.noStroke();
  p.fill(240, 180, 255, 90); // 透亮的粉紫色
  renderHeartShape(p, size * 1.1);

  // 2. 中層折射感 (內部微光)
  p.push();
  p.noStroke();
  p.translate(0, -size * 0.1);
  p.fill(250, 220, 255, 160);
  renderHeartShape(p, size * 0.9);
  p.pop();
  
  // 3. 銳利玻璃高光 (模擬光線折射)
  p.noStroke();
  p.fill(255, 255, 255, 200);
  p.ellipse(-size * 0.4, -size * 0.3, size * 0.7, size * 0.35);
  
  // 底部微弱反光
  p.fill(255, 255, 255, 60);
  p.ellipse(size * 0.1, size * 0.3, size * 0.3, size * 0.15);
  p.pop();
}

// 繪製玻璃泡泡的輔助函式
function drawGlassBubble(p, x, y, r) {
  p.push();
  p.translate(x, y);
  p.fill(255, 255, 255, 45);
  p.stroke(255, 255, 255, 100);
  p.strokeWeight(1);
  p.circle(0, 0, r * 2);
  
  p.noStroke();
  p.fill(255, 255, 255, 180);
  p.ellipse(-r * 0.4, -r * 0.4, r * 0.7, r * 0.4); // 高光
  p.pop();
}

function renderHeartShape(p, size) {
  p.beginShape();
  p.vertex(0, 0);
  // 調整貝茲參數，使頂部更圓、整體更飽滿寬闊
  p.bezierVertex(-size * 1.2, -size * 1.0, -size * 2.2, size * 0.5, 0, size);
  p.bezierVertex(size * 2.2, size * 0.5, size * 1.2, -size * 1.0, 0, 0);
  p.endShape(CLOSE);
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
