import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    recordVideo: {
      dir: 'public/',
      size: { width: 1280, height: 800 }
    },
    colorScheme: 'dark',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  console.log('Capturing video...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Go to workspace
  await page.goto('http://localhost:3000/workspace', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Start research
  const inputSelector = 'input[placeholder*="Ask Noēsis to research"]';
  await page.waitForSelector(inputSelector);
  await page.fill(inputSelector, 'Deep learning optimizations 2025');
  await page.keyboard.press('Enter');
  
  await page.waitForTimeout(3000);

  // Answer questions
  let loopCount = 0;
  while (loopCount < 10) {
    const nextBtn = await page.$('button:has-text("Next")');
    const runBtn = await page.$('button:has-text("Run research")');
    
    if (runBtn) {
      const options = await page.$$('button:has(span.rounded-full)');
      if (options.length > 0) await options[0].click();
      await page.waitForTimeout(500);
      await runBtn.click();
      break;
    } else if (nextBtn) {
      const options = await page.$$('button:has(span.rounded-full)');
      if (options.length > 0) await options[0].click();
      await page.waitForTimeout(500);
      await nextBtn.click();
      await page.waitForTimeout(1000);
    } else {
      break;
    }
    loopCount++;
  }
  
  // Wait a bit to show pipeline
  await page.waitForTimeout(10000);
  
  console.log('Done recording!');
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Rename video to raw_demo.webm
  fs.renameSync(videoPath, path.join('public', 'raw_demo.webm'));
})();
