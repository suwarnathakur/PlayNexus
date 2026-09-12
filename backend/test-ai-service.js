/**
 * PLAYNEXUS AI Service Independent Test Suite
 * Validates behavior analysis, strategy generation, JSON validation,
 * and seamless fallback when OpenAI is offline, timed out, or unauthenticated.
 */

import dotenv from 'dotenv';
dotenv.config();

import { AIService } from './src/services/aiService.js';

async function runAiServiceTests() {
  console.log('=== PLAYNEXUS NEURAL AI SERVICE VALIDATION ===\n');

  let passed = 0;
  let total = 0;

  async function test(title, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${title}:`, err.message);
    }
  }

  const mockTelemetry = [
    { action: 'attack', combo: 1, distanceToEnemy: 1.4 },
    { action: 'hit', damage: 16, combo: 1 },
    { action: 'dodge', direction: 'left' },
    { action: 'dodge', direction: 'left' },
    { action: 'dodge', direction: 'left' },
    { action: 'attack', combo: 2, distanceToEnemy: 1.5 },
    { action: 'hit', damage: 24, combo: 2 },
    { action: 'block' },
  ];

  // Test 1: Behavior Analysis Output & Schema
  await test('Behavior Analysis outputs valid Fighting DNA', async () => {
    const dna = await AIService.analyzeBehavior(mockTelemetry, 25);
    if (!dna) throw new Error('DNA output was null or undefined');
    if (typeof dna.aggression !== 'number' || dna.aggression < 0 || dna.aggression > 1) {
      throw new Error(`Invalid aggression value: ${dna.aggression}`);
    }
    if (dna.preferredDodge !== 'left') {
      throw new Error(`Expected preferredDodge 'left', got '${dna.preferredDodge}'`);
    }
    if (!dna.archetype || !Array.isArray(dna.strengths) || !Array.isArray(dna.weaknesses)) {
      throw new Error('Missing or invalid archetype/strengths/weaknesses');
    }
    console.log(`   Result: Aggression=${dna.aggression}, Dodge=${dna.preferredDodge}, Archetype=${dna.archetype}, Source=${dna.source}`);
  });

  // Test 2: Counter-Strategy Generation Output & Schema
  await test('Counter-Strategy Generation outputs valid tactics', async () => {
    const mockDna = {
      aggression: 0.85,
      defense: 0.35,
      mobility: 0.70,
      preferredDodge: 'left',
      dodgeLeftPercentage: 85,
      averageComboLength: 2.3,
      predictabilityIndex: 0.78,
    };
    const opponent = {
      codename: 'NEXUS_VALKYRIE',
      archetype: 'TACTICAL_SENTINEL',
    };

    const strategy = await AIService.generateStrategy(mockDna, opponent);
    if (!strategy) throw new Error('Strategy output was null or undefined');
    if (!['COUNTER_LEFT', 'COUNTER_RIGHT', 'NEUTRAL'].includes(strategy.counterDodge)) {
      throw new Error(`Invalid counterDodge: ${strategy.counterDodge}`);
    }
    if (!strategy.tacticalDescription || !strategy.targetComboPattern) {
      throw new Error('Missing tacticalDescription or targetComboPattern');
    }
    console.log(`   Result: CounterDodge=${strategy.counterDodge}, Defense=${strategy.defenseMode}, Desc="${strategy.tacticalDescription}", Source=${strategy.source}`);
  });

  // Test 3: Failure & Fallback Resilience (Simulate invalid API Key)
  await test('Graceful fallback when OpenAI API key is invalid/expired', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    try {
      // Set deliberately invalid key to trigger HTTP 401 or auth failure
      process.env.OPENAI_API_KEY = 'sk-deliberately-invalid-mock-key-for-testing';
      
      const dna = await AIService.analyzeBehavior(mockTelemetry, 20);
      if (!dna || !dna.aggression) {
        throw new Error('Fallback failed to return valid DNA');
      }
      if (dna.source !== 'RULE_BASED_FALLBACK') {
        throw new Error(`Expected source 'RULE_BASED_FALLBACK', got '${dna.source}'`);
      }
      console.log(`   Result: Seamlessly intercepted failure and engaged rule-based engine (Reason: ${dna.fallbackReason})`);
    } finally {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  // Test 4: Strict JSON Sanitization
  await test('Strict Schema Sanitization clamps out-of-bounds values', () => {
    const rawAiOutput = {
      aggression: 99.5, // Out of bounds
      defense: -12,     // Out of bounds
      mobility: 'invalid_string',
      preferredDodge: 'invalid_direction',
      archetype: 'SUPER_SAIYAN_UNKNOWN',
    };
    const fallback = {
      aggression: 0.5,
      defense: 0.5,
      mobility: 0.5,
      reactionTime: 0.28,
      preferredDodge: 'balanced',
      preferredRange: 'mid',
      averageComboLength: 1.2,
      repeatedCombos: ['LIGHT-LIGHT-HEAVY'],
      strengths: ['Baseline test'],
      weaknesses: ['Baseline weakness'],
      predictabilityIndex: 0.5,
      archetype: 'BALANCED_STRIKER',
    };

    const validated = AIService._validateFightingDna(rawAiOutput, fallback);
    if (validated.aggression !== 1.0) throw new Error(`Aggression should clamp to 1.0, got ${validated.aggression}`);
    if (validated.defense !== 0.1) throw new Error(`Defense should clamp to 0.1, got ${validated.defense}`);
    if (validated.mobility !== 0.5) throw new Error(`Mobility should fallback to 0.5, got ${validated.mobility}`);
    if (validated.preferredDodge !== 'balanced') throw new Error(`Dodge should fallback to 'balanced', got ${validated.preferredDodge}`);
    if (validated.archetype !== 'BALANCED_STRIKER') throw new Error(`Archetype should fallback to 'BALANCED_STRIKER', got ${validated.archetype}`);
    console.log(`   Result: Correctly sanitized malformed fields with mathematical clamping and fallback substitution.`);
  });

  console.log(`\n========================================`);
  console.log(`AI SERVICE RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAiServiceTests().catch((err) => {
  console.error('Fatal AI Service test runner error:', err);
  process.exit(1);
});
