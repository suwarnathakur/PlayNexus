import { Router } from 'express';
import { analyzeBehavior, generateStrategy, scanWeapon } from '../controllers/aiController.js';
import { getPlayerDNA } from '../controllers/playerController.js';
import { completeMatch, getLeaderboard } from '../controllers/matchController.js';
import { triggerLockIn } from '../controllers/lockInController.js';

const router = Router();

// 1. Behavioral AI Analysis
router.post('/analyze-behavior', analyzeBehavior);

// 2. Adaptive Counter-Strategy Generation
router.post('/generate-strategy', generateStrategy);

// 3. Player Fighting DNA Retrieval
router.get('/player/:playerId/dna', getPlayerDNA);

// 4. Match Completion & Telemetry Synchronization
router.post('/match/complete', completeMatch);

// 5. Adaptation Lock Detection & Challenge Trigger
router.post('/lock-in/trigger', triggerLockIn);

// 6. Global Leaderboard Retrieval
router.get('/leaderboard', getLeaderboard);

// 7. Camera Room Object -> Mythical Weapon Synthesis
router.post('/scan-weapon', scanWeapon);

export default router;
