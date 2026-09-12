import { AIService } from '../services/aiService.js';

export const analyzeBehavior = async (req, res, next) => {
  try {
    const { events = [], durationSeconds = 30, playerId } = req.body;

    const fightingDNA = await AIService.analyzeBehavior(events, durationSeconds);

    return res.status(200).json({
      success: true,
      data: {
        playerId: playerId || 'ANONYMOUS_OPERATIVE',
        fightingDNA,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateStrategy = async (req, res, next) => {
  try {
    const { fightingDNA, opponentPersonality = {} } = req.body;

    if (!fightingDNA) {
      return res.status(400).json({
        success: false,
        message: 'FIGHTING DNA OBJECT REQUIRED IN REQUEST BODY',
      });
    }

    const counterStrategy = await AIService.generateStrategy(fightingDNA, opponentPersonality);

    return res.status(200).json({
      success: true,
      data: {
        counterStrategy,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const scanWeapon = async (req, res, next) => {
  try {
    const { detectedItem = 'Book', visualFeatures = {} } = req.body;

    const synthesizedWeapon = await AIService.synthesizeWeaponFromScan(detectedItem, visualFeatures);

    return res.status(200).json({
      success: true,
      data: {
        weapon: synthesizedWeapon,
        synthesizedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

