import mongoose from 'mongoose';

const telemetryEventSchema = new mongoose.Schema(
  {
    id: String,
    action: {
      type: String,
      enum: [
        'attack',
        'block',
        'dodge',
        'movement',
        'hit',
        'miss',
        'damage_dealt',
        'damage_received',
      ],
      required: true,
    },
    direction: String,
    timestamp: Number,
    intervalSinceLastAction: Number,
    combo: Number,
    damage: Number,
    distanceToEnemy: Number,
    playerHealth: Number,
    enemyHealth: Number,
    details: String,
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    playerId: {
      type: String,
      required: true,
      index: true,
    },
    opponentId: {
      type: String,
      default: 'AI_OPPONENT_NEURAL_V2',
    },
    outcome: {
      type: String,
      enum: ['VICTORY', 'DEFEAT', 'ABANDONED', 'IN_PROGRESS'],
      required: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    playerFinalHp: {
      type: Number,
      default: 0,
    },
    enemyFinalHp: {
      type: Number,
      default: 0,
    },
    events: [telemetryEventSchema],
    metrics: {
      totalAttacks: { type: Number, default: 0 },
      successfulAttacks: { type: Number, default: 0 },
      missedAttacks: { type: Number, default: 0 },
      accuracyPercentage: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      dodges: { type: Number, default: 0 },
      dodgeLeftPercentage: { type: Number, default: 0 },
      dodgeRightPercentage: { type: Number, default: 0 },
      averageComboLength: { type: Number, default: 1.0 },
      maxCombo: { type: Number, default: 1 },
      totalDamageDealt: { type: Number, default: 0 },
      totalDamageReceived: { type: Number, default: 0 },
      aggression: { type: Number, default: 50 },
      defense: { type: Number, default: 50 },
      mobility: { type: Number, default: 50 },
      predictability: { type: Number, default: 50 },
    },
    fightingDNA: {
      type: mongoose.Schema.Types.Mixed,
    },
    counterStrategyUsed: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);
