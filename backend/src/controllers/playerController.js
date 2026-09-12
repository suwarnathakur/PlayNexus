import { Player } from '../models/Player.js';
import { BehaviorAnalysisService } from '../services/behaviorAnalysisService.js';

export const getPlayerDNA = async (req, res, next) => {
  try {
    const { playerId } = req.params;

    let player = null;
    try {
      player = await Player.findOne({ playerId });
    } catch {
      // If DB not connected or error, continue with graceful in-memory fallback
    }

    if (player && player.fightingDNA && player.fightingDNA.aggression) {
      return res.status(200).json({
        success: true,
        data: {
          playerId: player.playerId,
          username: player.username,
          level: player.level,
          fightingDNA: player.fightingDNA,
          source: 'DATABASE_RECORD',
        },
      });
    }

    // Default calibrated DNA profile if new or unregistered player
    const defaultDNA = BehaviorAnalysisService.analyzeBehavior([], 30);

    return res.status(200).json({
      success: true,
      data: {
        playerId,
        username: 'CYBER_OPERATIVE',
        level: 1,
        fightingDNA: defaultDNA,
        source: 'DEFAULT_CALIBRATION',
      },
    });
  } catch (error) {
    next(error);
  }
};
