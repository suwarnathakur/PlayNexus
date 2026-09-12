/**
 * PLAYNEXUS Backend API Validation Suite
 * Tests all 6 required endpoints against the running Express server.
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== PLAYNEXUS BACKEND API VALIDATION ===\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // Test 1: POST /api/analyze-behavior
  await test('POST /api/analyze-behavior', async () => {
    const res = await fetch(`${BASE_URL}/analyze-behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 'OPERATIVE_TEST_01',
        durationSeconds: 25,
        events: [
          { action: 'attack', combo: 2, distanceToEnemy: 1.8 },
          { action: 'dodge', direction: 'left' },
          { action: 'dodge', direction: 'left' },
          { action: 'hit', damage: 16, combo: 2 },
          { action: 'block' },
        ],
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.fightingDNA.aggression) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    console.log(`   DNA: Aggression=${json.data.fightingDNA.aggression}, Dodge=${json.data.fightingDNA.preferredDodge}, Archetype=${json.data.fightingDNA.archetype}`);
  });

  // Test 2: POST /api/generate-strategy
  await test('POST /api/generate-strategy', async () => {
    const res = await fetch(`${BASE_URL}/generate-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fightingDNA: {
          aggression: 0.78,
          defense: 0.35,
          mobility: 0.65,
          preferredDodge: 'left',
          dodgeLeftPercentage: 80,
          averageComboLength: 2.2,
          predictabilityIndex: 0.75,
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.counterStrategy) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    console.log(`   Counter Strategy: ${json.data.counterStrategy.tacticalDescription}`);
  });

  // Test 3: GET /api/player/:playerId/dna
  await test('GET /api/player/:playerId/dna', async () => {
    const res = await fetch(`${BASE_URL}/player/CYBER_STRIKER/dna`);
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.fightingDNA) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    console.log(`   Player DNA retrieved for ${json.data.playerId} (source: ${json.data.source})`);
  });

  // Test 4: POST /api/match/complete
  await test('POST /api/match/complete', async () => {
    const res = await fetch(`${BASE_URL}/match/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: 'MATCH-TEST-001',
        playerId: 'OPERATIVE_TEST_01',
        outcome: 'VICTORY',
        durationSeconds: 32,
        playerFinalHp: 72,
        enemyFinalHp: 0,
        events: [
          { action: 'attack', combo: 1, distanceToEnemy: 1.5 },
          { action: 'hit', damage: 16, combo: 1 },
          { action: 'dodge', direction: 'right' },
          { action: 'attack', combo: 2, distanceToEnemy: 1.6 },
          { action: 'hit', damage: 26, combo: 2 },
        ],
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.matchId) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    console.log(`   Match completed: ${json.data.matchId}, outcome=${json.data.outcome}`);
  });

  // Test 5: POST /api/lock-in/trigger
  await test('POST /api/lock-in/trigger', async () => {
    const res = await fetch(`${BASE_URL}/lock-in/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: 'OPERATIVE_TEST_01',
        recentDodges: ['left', 'left', 'left', 'left', 'left', 'right'],
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.triggered) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    console.log(`   Lock Triggered: ${json.data.challenge.directive} (${json.data.pattern.percentage}% Left)`);
  });

  // Test 6: GET /api/leaderboard
  await test('GET /api/leaderboard', async () => {
    const res = await fetch(`${BASE_URL}/leaderboard`);
    const json = await res.json();
    if (!res.ok || !json.success || !Array.isArray(json.data.leaderboard)) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    console.log(`   Leaderboard retrieved: ${json.data.leaderboard.length} contenders listed`);
  });

  // Test 7: POST /api/scan-weapon (Camera -> Weapon Synthesis)
  await test('POST /api/scan-weapon', async () => {
    const res = await fetch(`${BASE_URL}/scan-weapon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        detectedItem: 'Book',
        visualFeatures: { shape: 'rectangular', binding: 'hardcover' },
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data.weapon) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    const w = json.data.weapon;
    if (w.weapon !== 'Tome of Wisdom' || w.type !== 'Staff') {
      throw new Error(`Unexpected synthesis output: ${JSON.stringify(w)}`);
    }
    console.log(`   Synthesized: "${w.weapon}" (${w.type}) // ${w.bonus} (Source: ${w.source})`);
  });

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log(`========================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
