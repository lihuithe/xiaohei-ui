const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 设置视口大小
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // 访问页面
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  // 等待页面加载完成
  await page.waitForTimeout(2000);
  
  // 截图
  await page.screenshot({ 
    path: '/workspace/desktop-app/screenshot.png', 
    fullPage: false 
  });
  
  console.log('截图已保存到 /workspace/desktop-app/screenshot.png');
  
  await browser.close();
})();
