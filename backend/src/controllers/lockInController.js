import { LockInService } from '../services/lockInService.js';
import { Player } from '../models/Player.js';

export const triggerLockIn = async (req, res, next) => {
  try {
    const { recentDodges = [], playerId = 'CYBER_OPERATIVE' } = req.body;

    const lockResult = LockInService.evaluateDodgeLock({
      recentDodges,
      playerId,
    });

    if (lockResult.triggered) {
      // Record active challenge in Player model if available
      try {
        await Player.updateOne(
          { playerId },
          {
            $push: {
              activeBuffs: {
                buffType: lockResult.challenge.reward,
                unlockedAt: new Date(),
              },
            },
          }
        );
      } catch {
        // Graceful fallback
      }
    }

    return res.status(200).json({
      success: true,
      data: lockResult,
    });
  } catch (error) {
    next(error);
  }
};
