let capture;

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏原始的 HTML 視訊元件，避免在畫布下方重複顯示
  capture.hide();
}

function draw() {
  // 3. 設定畫布背景顏色為 e7c6ff
  background('#e7c6ff');

  // 4. 計算影像顯示的大小 (畫布寬高的 60%)
  let vW = width * 0.6;
  let vH = height * 0.6;

  // 5. & 6. 將攝影機影像繪製在畫布正中間
  image(capture, (width - vW) / 2, (height - vH) / 2, vW, vH);
}

function windowResized() {
  // 確保視窗大小改變時，畫布依然保持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}
