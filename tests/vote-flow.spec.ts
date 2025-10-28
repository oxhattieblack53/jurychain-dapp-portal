import { test, expect } from '@playwright/test';

test.describe('JuryChain 投票功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到 DApp 页面
    await page.goto('http://localhost:8080/dapp');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示测试案例', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('h2:has-text("Cases")');

    // 检查案例数量
    const foundText = await page.locator('h2 + p').textContent();
    console.log('案例数量:', foundText);
    expect(foundText).toContain('found');

    // 检查是否有案例卡片
    const caseCards = await page.locator('h3').count();
    console.log('案例卡片数量:', caseCards);
    expect(caseCards).toBeGreaterThan(0);

    // 检查第一个案例的标题
    const firstCaseTitle = await page.locator('h3').first().textContent();
    console.log('第一个案例标题:', firstCaseTitle);
    expect(firstCaseTitle).toBeTruthy();
  });

  test('应该正确显示案例详情', async ({ page }) => {
    // 等待案例加载
    await page.waitForSelector('h3');

    // 获取案例信息
    const caseTitle = await page.locator('h3').first().textContent();
    const status = await page.locator('text=Status').locator('..').locator('text=Active, text=Closed').textContent();
    const jurors = await page.locator('text=Jurors').locator('..').locator('+ div').textContent();
    const votes = await page.locator('text=Votes Cast').locator('..').locator('+ div').textContent();

    console.log('案例详情:');
    console.log('  标题:', caseTitle);
    console.log('  状态:', status);
    console.log('  陪审员:', jurors);
    console.log('  投票数:', votes);

    expect(caseTitle).toBeTruthy();
    expect(status).toMatch(/Active|Closed/);
  });

  test('应该显示钱包连接按钮', async ({ page }) => {
    // 检查连接钱包按钮或已连接的钱包地址
    const hasConnectButton = await page.locator('button:has-text("Connect Wallet")').count();
    const hasWalletAddress = await page.locator('button[class*="font-mono"]').count();

    console.log('连接钱包按钮:', hasConnectButton > 0 ? '显示' : '不显示');
    console.log('钱包地址:', hasWalletAddress > 0 ? '已连接' : '未连接');

    expect(hasConnectButton + hasWalletAddress).toBeGreaterThan(0);
  });

  test('应该能够查看完整详情', async ({ page }) => {
    // 等待案例加载
    await page.waitForSelector('h3');

    // 查找"View Full Details"按钮
    const detailsButton = page.locator('text=View Full Details').first();
    const isVisible = await detailsButton.isVisible();

    console.log('查看详情按钮:', isVisible ? '可见' : '不可见');
    expect(isVisible).toBeTruthy();
  });

  test('应该显示正确的元数据', async ({ page }) => {
    // 等待案例加载
    await page.waitForSelector('h3');

    // 检查是否显示了解析后的标题（而不是 base64）
    const firstTitle = await page.locator('h3').first().textContent();
    console.log('案例标题:', firstTitle);

    // 确保标题不包含 base64 字符串
    expect(firstTitle).not.toContain('data:application/json');
    expect(firstTitle).not.toContain('base64');

    // 检查是否有描述文本
    const description = await page.locator('p.text-sm.text-muted-foreground').first().textContent();
    console.log('案例描述:', description?.substring(0, 50));
  });

  test('应该显示法官地址', async ({ page }) => {
    // 等待案例加载
    await page.waitForSelector('h3');

    // 查找法官地址
    const judgeText = await page.locator('text=/Judge:.*0x/').first().textContent();
    console.log('法官信息:', judgeText);

    expect(judgeText).toContain('Judge:');
    expect(judgeText).toContain('0x');
  });

  test('网络请求应该快速完成', async ({ page }) => {
    const startTime = Date.now();

    // 导航并等待网络空闲
    await page.goto('http://localhost:8080/dapp');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log('页面加载时间:', loadTime, 'ms');

    // 页面应该在5秒内加载完成
    expect(loadTime).toBeLessThan(5000);
  });

  test('应该使用批量优化（少量RPC调用）', async ({ page }) => {
    const rpcCalls: string[] = [];

    // 监听网络请求
    page.on('request', request => {
      const url = request.url();
      if (url.includes('alchemy') || url.includes('sepolia') || url.includes('rpc')) {
        rpcCalls.push(request.method());
      }
    });

    // 导航到页面
    await page.goto('http://localhost:8080/dapp');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('RPC 调用次数:', rpcCalls.length);
    console.log('RPC 调用:', rpcCalls);

    // 使用批量优化后，RPC调用应该很少（2-5次）
    expect(rpcCalls.length).toBeLessThan(10);
  });
});
