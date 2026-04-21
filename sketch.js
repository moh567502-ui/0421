let capture;
let pg; // 宣告繪圖層變數

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML 視訊元件，避免在畫布下方重複顯示
  capture.hide();

  // 產生一個與顯示視訊畫面寬高一樣的繪圖層 (畫布寬高的 60%)
  pg = createGraphics(windowWidth * 0.6, windowHeight * 0.6);
}

function draw() {
  // 3. 設定畫布背景顏色為 e7c6ff
  background('#e7c6ff');

  // 4. 計算影像顯示的大小 (畫布寬高的 60%)
  let vW = width * 0.6;
  let vH = height * 0.6;
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 5. & 6. 將攝影機影像繪製在畫布正中間，並修正左右顛倒
  push(); // 儲存目前的繪圖狀態
  translate(width, 0); // 將座標原點移至畫布右側
  scale(-1, 1);        // 水平翻轉座標系 (x 軸變為反向)
  
  // 繪製影像。因為座標系已翻轉，原本的居中計算依然適用
  image(capture, x, y, vW, vH);
  pop();  // 還原繪圖狀態，避免影響到其他可能要繪製的圖形

  // 在繪圖層 (pg) 上繪製內容 (範例：畫出一個紅色外框與文字)
  pg.clear(); // 確保背景透明，只顯示畫上去的內容
  pg.stroke(255, 0, 0);
  pg.strokeWeight(5);
  pg.noFill();
  pg.rect(0, 0, pg.width, pg.height); // 在繪圖層邊緣畫框
  pg.fill(255, 0, 0);
  pg.noStroke();
  pg.textAlign(CENTER, CENTER);
  pg.text("這是建立的 Graphics 內容", pg.width / 2, pg.height / 2);

  // 將此繪圖層顯示在視訊畫面的上方 (疊加在畫布中間)
  image(pg, x, y, vW, vH);
}

function windowResized() {
  // 確保視窗大小改變時，畫布依然保持全螢幕
  resizeCanvas(windowWidth, windowHeight);
  // 同步更新繪圖層的大小，確保始終與視訊顯示尺寸一致
  pg.resizeCanvas(windowWidth * 0.6, windowHeight * 0.6);
}
