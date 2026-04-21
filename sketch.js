let capture;
let pg; // 宣告繪圖層變數
let bubbles = []; // 存放泡泡數據的陣列
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

  // 初始化泡泡數據
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: random(pg.width),
      y: random(pg.height),
      r: random(4, 12),
      speed: random(1, 3)
    });
  }

  // 建立按鈕
  btnFlash = createButton('閃光');
  btnFlash.mousePressed(() => flashAlpha = 255);
  
  btnFilter = createButton('切換濾鏡');
  btnFilter.mousePressed(() => filterMode = (filterMode + 1) % 3);
  
  btnSave = createButton('儲存圖片');
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
    // 濾鏡 1: 蝴蝶結 (繪製在上方大約頭部的位置)
    pg.push();
    pg.translate(pg.width / 2, pg.height * 0.25);
    pg.noStroke();
    pg.fill('#ffc8dd'); // 粉紅色
    pg.triangle(0, 0, -60, -40, -60, 40); // 左翼
    pg.triangle(0, 0, 60, -40, 60, 40);  // 右翼
    pg.fill('#ffafcc');
    pg.circle(0, 0, 25); // 中間的結
    pg.pop();
  } else if (filterMode === 2) {
    // 濾鏡 2: 愛心飄浮
    pg.noStroke();
    pg.fill(255, 100, 100, 150);
    for (let i = 0; i < 6; i++) {
      let hX = (frameCount * 1.5 + i * 100) % pg.width;
      let hY = (pg.height - (frameCount * 2 + i * 120) % pg.height);
      drawHeart(pg, hX, hY, 15);
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

// 繪製愛心的輔助函式
function drawHeart(p, x, y, size) {
  p.push();
  p.translate(x, y);
  p.beginShape();
  p.vertex(0, 0);
  p.bezierVertex(-size/2, -size/2, -size, size/3, 0, size);
  p.bezierVertex(size, size/3, size/2, -size/2, 0, 0);
  p.endShape();
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
