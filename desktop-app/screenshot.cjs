const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 设置视口大小
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // 启用控制台日志
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // 访问页面
  console.log('正在访问页面...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  
  // 等待更长时间让页面完全加载
  console.log('等待页面加载...');
  await page.waitForTimeout(5000);
  
  // 截图
  console.log('正在截图...');
  await page.screenshot({ 
    path: '/workspace/desktop-app/screenshot.png', 
    fullPage: false 
  });
  
  console.log('截图已保存到 /workspace/desktop-app/screenshot.png');
  
  // 获取页面标题确认是否正常
  const title = await page.title();
  console.log('页面标题:', title);
  
  await browser.close();
})();
