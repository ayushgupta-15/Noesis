import { chromium } from 'playwright';

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set dark mode and viewport
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Landing page
  console.log('Capturing landing.png...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'public/landing.png' });

  // Go to workspace
  console.log('Navigating to workspace...');
  await page.goto('http://localhost:3000/workspace', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Capturing workspace.png...');
  await page.screenshot({ path: 'public/workspace.png' });

  // 2. Start research to get into the pipeline
  console.log('Starting a research query...');
  const inputSelector = 'input[placeholder*="Ask Noēsis to research"]';
  await page.waitForSelector(inputSelector);
  await page.fill(inputSelector, 'Deep learning optimizations 2025');
  await page.keyboard.press('Enter');
  
  console.log('Waiting for questions...');
  await page.waitForTimeout(3000); // let API return questions

  // Answer questions
  let loopCount = 0;
  while (loopCount < 10) {
    // Check if we are still answering questions
    const nextBtn = await page.$('button:has-text("Next")');
    const runBtn = await page.$('button:has-text("Run research")');
    
    if (runBtn) {
      // Select first option
      const options = await page.$$('button:has(span.rounded-full)');
      if (options.length > 0) await options[0].click();
      await page.waitForTimeout(500);
      await runBtn.click();
      break; // Run research starts
    } else if (nextBtn) {
      const options = await page.$$('button:has(span.rounded-full)');
      if (options.length > 0) await options[0].click();
      await page.waitForTimeout(500);
      await nextBtn.click();
      await page.waitForTimeout(1000); // wait for next question
    } else {
      break; // No buttons found
    }
    loopCount++;
  }
  
  // 3. Workspace / Pipeline running
  console.log('Waiting for pipeline to start...');
  await page.waitForTimeout(3000); // let UI settle and show some pipeline events
  console.log('Capturing pipeline.png...');
  await page.screenshot({ path: 'public/pipeline.png' });
  
  // Wait for the report to be generated
  console.log('Waiting for report to generate (this might take 30-60s)...');
  try {
    // Look for Export Markdown button
    await page.waitForSelector('text="Export Markdown"', { timeout: 60000 });
    await page.waitForTimeout(2000); // let UI settle
  } catch (e) {
    console.log('Timeout waiting for report to finish, taking snapshot anyway');
  }
  
  console.log('Capturing report.png...');
  await page.screenshot({ path: 'public/report.png' });

  // 4. History page
  console.log('Capturing history.png...');
  await page.goto('http://localhost:3000/history', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'public/history.png' });

  console.log('Done!');
  await browser.close();
})();
