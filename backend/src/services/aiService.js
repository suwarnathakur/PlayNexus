/**
 * PLAYNEXUS Neural AI Service
 * Bridges server-side OpenAI API (gpt-4o-mini) for deep behavioral analysis
 * and adaptive strategy generation.
 * 
 * GUARANTEE: The game will NEVER break or hang if OpenAI is offline,
 * misconfigured, times out, or hits rate limits. It automatically falls back
 * to the deterministic rule-based engine.
 */

import { BehaviorAnalysisService } from './behaviorAnalysisService.js';
import { StrategyEngineService } from './strategyEngineService.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class AIService {
  /**
   * Evaluates match telemetry into structured Fighting DNA.
   * Leverages OpenAI if configured, otherwise falls back gracefully.
   * 
   * @param {Array} events - Telemetry events stream
   * @param {number} durationSeconds - Match duration
   * @returns {Promise<Object>} Structured Fighting DNA
   */
  static async analyzeBehavior(events = [], durationSeconds = 30) {
    // 1. Always compute rule-based baseline first as instant fallback
    const ruleBasedDna = BehaviorAnalysisService.analyzeBehavior(events, durationSeconds);

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('ℹ️ [AI_SERVICE] OpenAI key not set. Using high-performance rule-based analysis.');
      return {
        ...ruleBasedDna,
        source: 'RULE_BASED_ENGINE',
      };
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 4000;

    // Compact summary to keep prompt tokens and latency minimal
    const telemetrySummary = {
      durationSeconds,
      totalEvents: events.length,
      attackCount: ruleBasedDna.totalAttacks,
      accuracyPercentage: ruleBasedDna.accuracyPercentage,
      dodgeLeftPct: ruleBasedDna.dodgeLeftPercentage,
      dodgeRightPct: ruleBasedDna.dodgeRightPercentage,
      preferredDodge: ruleBasedDna.preferredDodge,
      avgComboLength: ruleBasedDna.averageComboLength,
      ruleAggression: ruleBasedDna.aggression,
      ruleDefense: ruleBasedDna.defense,
      ruleMobility: ruleBasedDna.mobility,
    };

    const systemPrompt = `You are PLAYNEXUS Neural Battle Analyzer. Analyze fighting game telemetry and output a strict JSON Fighting DNA profile.
Return ONLY valid JSON with these exact fields:
{
  "aggression": number (0.0 to 1.0),
  "defense": number (0.0 to 1.0),
  "mobility": number (0.0 to 1.0),
  "reactionTime": number (e.g. 0.25 to 0.40),
  "preferredDodge": "left" | "right" | "balanced",
  "preferredRange": "close" | "mid" | "far",
  "averageComboLength": number,
  "repeatedCombos": string[],
  "strengths": string[],
  "weaknesses": string[],
  "predictabilityIndex": number (0.0 to 1.0),
  "archetype": "BERSERKER" | "TURTLE" | "PHANTOM" | "TACTICIAN" | "BALANCED_STRIKER",
  "tacticalNotes": string
}`;

    const userPrompt = `Match Telemetry Summary: ${JSON.stringify(telemetrySummary)}`;

    try {
      console.log(`🤖 [AI_SERVICE] Requesting OpenAI behavioral analysis (${model})...`);
      const response = await this._callOpenAIWithTimeout({
        apiKey,
        model,
        systemPrompt,
        userPrompt,
        timeoutMs,
        maxTokens: 450,
      });

      const parsed = JSON.parse(response);

      // Strict JSON Schema Validation
      const validatedDna = this._validateFightingDna(parsed, ruleBasedDna);
      console.log(`✅ [AI_SERVICE] OpenAI behavioral analysis successful! Archetype: ${validatedDna.archetype}`);
      return {
        ...validatedDna,
        source: 'OPENAI_GPT_4O_MINI',
      };
    } catch (err) {
      console.warn(`⚠️ [AI_SERVICE] OpenAI analysis unavailable (${err.name}: ${err.message}). Engaging rule-based fallback.`);
      return {
        ...ruleBasedDna,
        source: 'RULE_BASED_FALLBACK',
        fallbackReason: err.message,
      };
    }
  }

  /**
   * Generates an adaptive counter-strategy from Fighting DNA & Opponent Personality.
   * 
   * @param {Object} fightingDNA - Player Fighting DNA
   * @param {Object} opponentPersonality - AI Opponent identity & modifiers
   * @returns {Promise<Object>} Structured Counter-Strategy
   */
  static async generateStrategy(fightingDNA = {}, opponentPersonality = {}) {
    // 1. Generate rule-based baseline strategy as fallback
    const ruleBasedStrategy = StrategyEngineService.generateStrategy(fightingDNA);

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('ℹ️ [AI_SERVICE] OpenAI key not set. Using rule-based counter-strategy engine.');
      return {
        ...ruleBasedStrategy,
        source: 'RULE_BASED_ENGINE',
      };
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 4000;

    const opponent = {
      codename: opponentPersonality.codename || 'NEURAL_SENTINEL',
      archetype: opponentPersonality.archetype || 'ADAPTIVE_COUNTER',
      evolutionIndex: opponentPersonality.evolutionIndex || 1,
    };

    const playerProfile = {
      archetype: fightingDNA.archetype || 'BALANCED_STRIKER',
      preferredDodge: fightingDNA.preferredDodge || 'balanced',
      dodgeLeftPercentage: fightingDNA.dodgeLeftPercentage ?? 50,
      dodgeRightPercentage: fightingDNA.dodgeRightPercentage ?? 50,
      aggression: fightingDNA.aggression ?? 0.5,
      defense: fightingDNA.defense ?? 0.5,
      mobility: fightingDNA.mobility ?? 0.5,
      predictabilityIndex: fightingDNA.predictabilityIndex ?? 0.5,
      repeatedCombos: fightingDNA.repeatedCombos || ['LIGHT-LIGHT-HEAVY'],
      weaknesses: fightingDNA.weaknesses || [],
    };

    const systemPrompt = `You are PLAYNEXUS Adaptive Counter-Strategy Engine. The opponent AI learns how the human player fights.
Output ONLY strict JSON matching this schema:
{
  "counterDodge": "COUNTER_LEFT" | "COUNTER_RIGHT" | "NEUTRAL",
  "defenseMode": "HIGH_GUARD" | "NORMAL" | "EVASIVE",
  "pressureMode": "RELENTLESS_CHASE" | "METHODICAL" | "BAIT_AND_PUNISH",
  "targetComboPattern": string,
  "tacticalDescription": string,
  "targetWeakness": string,
  "activeTactics": string[],
  "blockProbability": number (0.2 to 0.95),
  "counterAttackProbability": number (0.2 to 0.95),
  "approachSpeedMultiplier": number (0.8 to 1.6),
  "adaptationConfidence": number (0.5 to 1.0)
}`;

    const userPrompt = `Player DNA: ${JSON.stringify(playerProfile)}\nOpponent Persona: ${JSON.stringify(opponent)}`;

    try {
      console.log(`🤖 [AI_SERVICE] Generating OpenAI counter-strategy (${model})...`);
      const response = await this._callOpenAIWithTimeout({
        apiKey,
        model,
        systemPrompt,
        userPrompt,
        timeoutMs,
        maxTokens: 400,
      });

      const parsed = JSON.parse(response);

      // Strict validation
      const validatedStrategy = this._validateStrategy(parsed, ruleBasedStrategy);
      console.log(`✅ [AI_SERVICE] OpenAI counter-strategy generated: "${validatedStrategy.tacticalDescription}"`);
      return {
        ...validatedStrategy,
        source: 'OPENAI_GPT_4O_MINI',
      };
    } catch (err) {
      console.warn(`⚠️ [AI_SERVICE] OpenAI strategy unavailable (${err.name}: ${err.message}). Engaging rule-based fallback.`);
      return {
        ...ruleBasedStrategy,
        source: 'RULE_BASED_FALLBACK',
        fallbackReason: err.message,
      };
    }
  }

  /**
   * Internal helper: OpenAI HTTP completion with strict timeout abort controller.
   */
  static async _callOpenAIWithTimeout({ apiKey, model, systemPrompt, userPrompt, timeoutMs, maxTokens }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty completion content from OpenAI');

      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Validates & sanitizes OpenAI Fighting DNA against game constraints.
   */
  static _validateFightingDna(data, fallback) {
    if (!data || typeof data !== 'object') return fallback;

    const clamp = (val, min, max, def) => {
      const num = Number(val);
      return isNaN(num) ? def : Math.min(max, Math.max(min, num));
    };

    const validDodges = ['left', 'right', 'balanced'];
    const validRanges = ['close', 'mid', 'far'];
    const validArchetypes = ['BERSERKER', 'TURTLE', 'PHANTOM', 'TACTICIAN', 'BALANCED_STRIKER'];

    return {
      aggression: Number(clamp(data.aggression, 0.1, 1.0, fallback.aggression).toFixed(2)),
      defense: Number(clamp(data.defense, 0.1, 1.0, fallback.defense).toFixed(2)),
      mobility: Number(clamp(data.mobility, 0.1, 1.0, fallback.mobility).toFixed(2)),
      reactionTime: Number(clamp(data.reactionTime, 0.15, 0.6, fallback.reactionTime).toFixed(2)),
      preferredDodge: validDodges.includes(data.preferredDodge) ? data.preferredDodge : fallback.preferredDodge,
      preferredRange: validRanges.includes(data.preferredRange) ? data.preferredRange : fallback.preferredRange,
      averageComboLength: Number(clamp(data.averageComboLength, 1.0, 5.0, fallback.averageComboLength).toFixed(1)),
      repeatedCombos: Array.isArray(data.repeatedCombos) && data.repeatedCombos.length > 0
        ? data.repeatedCombos
        : fallback.repeatedCombos,
      strengths: Array.isArray(data.strengths) && data.strengths.length > 0
        ? data.strengths
        : fallback.strengths,
      weaknesses: Array.isArray(data.weaknesses) && data.weaknesses.length > 0
        ? data.weaknesses
        : fallback.weaknesses,
      predictabilityIndex: Number(clamp(data.predictabilityIndex, 0.1, 1.0, fallback.predictabilityIndex).toFixed(2)),
      archetype: validArchetypes.includes(data.archetype) ? data.archetype : fallback.archetype,
      tacticalNotes: data.tacticalNotes || `${fallback.archetype} tactical baseline active.`,
      // Retain ground-truth event stats
      totalAttacks: fallback.totalAttacks,
      accuracyPercentage: fallback.accuracyPercentage,
      dodgeLeftPercentage: fallback.dodgeLeftPercentage,
      dodgeRightPercentage: fallback.dodgeRightPercentage,
    };
  }

  /**
   * Validates & sanitizes OpenAI Strategy against game constraints.
   */
  static _validateStrategy(data, fallback) {
    if (!data || typeof data !== 'object') return fallback;

    const clamp = (val, min, max, def) => {
      const num = Number(val);
      return isNaN(num) ? def : Math.min(max, Math.max(min, num));
    };

    const validDodgeCounters = ['COUNTER_LEFT', 'COUNTER_RIGHT', 'NEUTRAL'];
    const validDefense = ['HIGH_GUARD', 'NORMAL', 'EVASIVE'];
    const validPressure = ['RELENTLESS_CHASE', 'METHODICAL', 'BAIT_AND_PUNISH'];

    const counterDodge = validDodgeCounters.includes(data.counterDodge)
      ? data.counterDodge
      : fallback.counterDodge;

    const defenseMode = validDefense.includes(data.defenseMode)
      ? data.defenseMode
      : fallback.defenseMode;

    const pressureMode = validPressure.includes(data.pressureMode)
      ? data.pressureMode
      : fallback.pressureMode;

    const blockProbability = clamp(data.blockProbability, 0.2, 0.95, fallback.blockProbabilityOnPlayerAttack);
    const counterAttackProbability = clamp(data.counterAttackProbability, 0.2, 0.95, fallback.counterAttackAfterBlockProbability);
    const approachSpeedMultiplier = clamp(data.approachSpeedMultiplier, 0.8, 1.6, fallback.approachSpeedMultiplier);
    const adaptationConfidence = clamp(data.adaptationConfidence, 0.5, 1.0, fallback.adaptationConfidence);

    return {
      id: `STRAT-AI-${Date.now().toString(36).toUpperCase()}`,
      counterDodge,
      defenseMode,
      pressureMode,
      targetComboPattern: data.targetComboPattern || fallback.targetComboPattern,
      tacticalDescription: data.tacticalDescription || fallback.tacticalDescription,
      targetWeakness: data.targetWeakness || 'High predictability in core combat cadence',
      activeTactics: Array.isArray(data.activeTactics) && data.activeTactics.length > 0
        ? data.activeTactics
        : fallback.activeTactics,
      blockProbabilityOnPlayerAttack: blockProbability,
      counterAttackAfterBlockProbability: counterAttackProbability,
      approachSpeedMultiplier,
      adaptationConfidence,
      dodgeLeftFrequency: fallback.dodgeLeftFrequency,
      comboPatternName: data.targetComboPattern || fallback.targetComboPattern,
      predictabilityLevel: fallback.predictabilityLevel,
    };
  }

  /**
   * Synthesizes a mythical combat weapon from a camera-detected real-world item.
   * Input: detectedItem (e.g. "Book", "Coffee Mug", "Pen", etc.)
   * Output: { detectedItem, weapon, type, bonus, powerBonusPercent, lore, rarity, source }
   */
  static async synthesizeWeaponFromScan(detectedItem = 'Book', visualFeatures = {}) {
    const catalog = {
      book: {
        detectedItem: 'Book',
        weapon: 'Tome of Wisdom',
        type: 'Staff',
        bonus: '+15% Ability Power',
        powerBonusPercent: 15,
        lore: 'Ancient codex inscribed with arcane quantum telemetry, amplifying strike resonance.',
        rarity: 'MYTHICAL',
      },
      coffeemug: {
        detectedItem: 'Coffee Mug',
        weapon: 'Thermal Plasma Cannon',
        type: 'Blaster',
        bonus: '+18% Heavy Strike Impact',
        powerBonusPercent: 18,
        lore: 'Pressurized thermal conduit venting superheated energy on kinetic impact.',
        rarity: 'RARE',
      },
      pen: {
        detectedItem: 'Pen',
        weapon: 'Needle of Precision',
        type: 'Dagger',
        bonus: '+20% Critical Hit Rate',
        powerBonusPercent: 20,
        lore: 'Needle-point monomolecular blade engineered for high-frequency vital strikes.',
        rarity: 'EPIC',
      },
      smartphone: {
        detectedItem: 'Smartphone',
        weapon: 'EMP Neural Disruptor',
        type: 'Tech Gauntlet',
        bonus: '+25% AI Adaptation Jammer',
        powerBonusPercent: 25,
        lore: 'Micro-circuit array emitting electromagnetic pulses that delay enemy counter-strategies.',
        rarity: 'LEGENDARY',
      },
      waterbottle: {
        detectedItem: 'Water Bottle',
        weapon: 'Cryo-Kinetic Condenser',
        type: 'Mace',
        bonus: '+15% Stun Duration & Enemy Slow',
        powerBonusPercent: 15,
        lore: 'Sub-zero pressure vessel freezing enemy momentum upon clean hits.',
        rarity: 'RARE',
      },
      keyboard: {
        detectedItem: 'Keyboard',
        weapon: 'Cipher Blade',
        type: 'Shortsword',
        bonus: '+16% Attack Speed',
        powerBonusPercent: 16,
        lore: 'Tactile switch-matrix forged into high-frequency vibrating edge.',
        rarity: 'EPIC',
      },
    };

    const cleanKey = String(detectedItem).toLowerCase().replace(/[^a-z]/g, '');
    let matchedFallback =
      catalog[cleanKey] ||
      Object.values(catalog).find((c) => cleanKey.includes(c.detectedItem.toLowerCase())) ||
      catalog.book;

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return {
        ...matchedFallback,
        source: 'RULE_BASED_ENGINE',
      };
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 4000;

    const systemPrompt = `You are PLAYNEXUS Mythical Weapon Forge. Convert everyday room objects detected via camera into badass cyber-mythical combat weapons.
Output ONLY strict JSON matching this schema:
{
  "detectedItem": string,
  "weapon": string,
  "type": "Staff" | "Sword" | "Blaster" | "Dagger" | "Tech Gauntlet" | "Mace" | "Shield",
  "bonus": string,
  "powerBonusPercent": number,
  "lore": string,
  "rarity": "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHICAL"
}`;

    const userPrompt = `Detected Room Object: ${detectedItem}. Visual Features: ${JSON.stringify(visualFeatures)}`;

    try {
      const response = await this._callOpenAIWithTimeout({
        apiKey,
        model,
        systemPrompt,
        userPrompt,
        timeoutMs,
        maxTokens: 250,
      });

      const parsed = JSON.parse(response);
      if (!parsed.weapon || !parsed.type || !parsed.bonus) {
        throw new Error('Invalid weapon schema from OpenAI');
      }

      return {
        detectedItem: parsed.detectedItem || matchedFallback.detectedItem,
        weapon: parsed.weapon,
        type: parsed.type,
        bonus: parsed.bonus,
        powerBonusPercent: Number(parsed.powerBonusPercent) || matchedFallback.powerBonusPercent,
        lore: parsed.lore || matchedFallback.lore,
        rarity: parsed.rarity || matchedFallback.rarity,
        source: 'OPENAI_GPT_4O_MINI',
      };
    } catch (err) {
      console.warn(`⚠️ [AI_SERVICE] Weapon synthesis fallback (${err.message}).`);
      return {
        ...matchedFallback,
        source: 'RULE_BASED_FALLBACK',
      };
    }
  }
}
