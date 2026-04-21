let capture;
let pg; // 宣告繪圖層變數
let bubbles = []; // 存放泡泡數據的陣列
let filterMode = 0; // 0: 泡泡, 1: 蝴蝶結, 2: 愛心
let flashAlpha = 0; // 閃光燈透明度
let btnFlash, btnFilter; // 按鈕變數

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
  
  updateButtonPositions();
}

function updateButtonPositions() {
  // 計算按鈕位置，置於手機畫面下方
  let vH = height * 0.7;
  let y = (height - vH) / 2;
  btnFlash.position(width / 2 - 60, y + vH + 20);
  btnFilter.position(width / 2 + 10, y + vH + 20);
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

  // 繪製並更新泡泡效果
  for (let b of bubbles) {
    // 1. 泡泡球體主體：淡白色填充增加玻璃通透感
    pg.fill(255, 255, 255, 40);
    pg.stroke(255, 255, 255, 120);
    pg.strokeWeight(0.5);
    pg.circle(b.x, b.y, b.r * 2);

    // 2. 玻璃高光 (Specular Highlight)：在左上方繪製一個微型橢圓，模擬光源反射
    pg.noStroke();
    pg.fill(255, 255, 255, 220);
    pg.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.4, b.r * 0.6, b.r * 0.4);

    // 3. 底部微弱反光：增加球體的立體厚度感
    pg.fill(255, 255, 255, 60);
    pg.ellipse(b.x + b.r * 0.3, b.y + b.r * 0.3, b.r * 0.4, b.r * 0.4);

    // 更新物理運動
    b.y -= b.speed; // 向上飄動
    // 加入一點左右隨機晃動的感感
    b.x += sin(frameCount * 0.05 + b.r) * 0.5;

    // 如果泡泡完全飄出上方邊界，則重置到下方重新開始
    if (b.y < -b.r * 2) {
      b.y = pg.height + b.r * 2;
      b.x = random(pg.width);
    }
  }

  // 將此繪圖層顯示在視訊畫面的上方 (疊加在畫布中間)
  image(pg, x, y, vW, vH);
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
