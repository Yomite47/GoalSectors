const BASE_URL = 'http://localhost:3000';
const USER_ID = 'test-ops-user-' + Date.now();

async function runTest(name, message, enabledSectors = ['Productivity', 'Habits', 'Goals']) {
  console.log(`\n=== TEST: ${name} ===`);
  console.log(`Message: "${message}"`);
  console.log(`Sectors: ${enabledSectors.join(', ')}`);
  
  const startTime = Date.now();
  try {
    // 1. Call Coach API
    const res = await fetch(`${BASE_URL}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        message: message,
        enabledSectors: enabledSectors
      })
    });

    const data = await res.json();
    const duration = Date.now() - startTime;

    if (!res.ok) {
      console.log(`❌ Coach API Error (${res.status}):`, data);
      return;
    }

    console.log(`✅ Coach Response (${duration}ms): "${data.assistant_message}"`);
    console.log(`   Actions: ${data.actions_applied}`);
    
    // 2. Verify Eval in Response
    if (data.eval) {
      console.log('📊 Eval in Response:');
      console.log(`   Score: ${data.eval.score_total}/100`);
      console.log(`   Schema: ${data.eval.scores.schema}`);
      console.log(`   Sector: ${data.eval.scores.sector_compliance}`);
    } else {
      console.log('⚠️ No evaluation in response');
    }

    // 3. Verify Ops API
    // Give a small delay for DB persistence if async (though local memory is sync)
    await new Promise(r => setTimeout(r, 500)); 

    const opsRes = await fetch(`${BASE_URL}/api/ops/runs?userId=${USER_ID}`);
    const opsData = await opsRes.json();
    
    if (opsData.runs && opsData.runs.length > 0) {
        const lastRun = opsData.runs[0]; // Sorted by created_at desc
        console.log('🔍 Ops Dashboard Verification:');
        console.log(`   Run ID: ${lastRun.id}`);
        console.log(`   Score Stored: ${lastRun.eval?.score_total}`);
        console.log(`   Opik Enabled: ${opsData.opikStatus?.enabled}`);
    } else {
        console.log('❌ Run not found in Ops API!');
    }

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }
}

async function main() {
  console.log(`Target: ${BASE_URL}`);
  console.log(`User ID: ${USER_ID}`);
  
  // 1. Happy Path
  await runTest('Happy Path', 'Create a task to buy milk tomorrow', ['Productivity']);

  // 2. Sector Violation
  await runTest('Sector Violation', 'Create a task to buy milk', []); // No sectors enabled
}

main();
