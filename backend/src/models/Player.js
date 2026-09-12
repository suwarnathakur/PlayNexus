import mongoose from 'mongoose';

const fightingDNASchema = new mongoose.Schema(
  {
    aggression: { type: Number, default: 0.65 },
    defense: { type: Number, default: 0.45 },
    mobility: { type: Number, default: 0.58 },
    reactionTime: { type: Number, default: 0.28 },
    preferredDodge: {
      type: String,
      enum: ['left', 'right', 'backward', 'forward', 'balanced'],
      default: 'balanced',
    },
    preferredRange: {
      type: String,
      enum: ['close', 'mid', 'far'],
      default: 'close',
    },
    averageComboLength: { type: Number, default: 1.8 },
    predictabilityIndex: { type: Number, default: 0.5 },
    repeatedCombos: [{ type: String }],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    archetype: {
      type: String,
      enum: ['BERSERKER', 'TURTLE', 'PHANTOM', 'TACTICIAN', 'BALANCED_STRIKER'],
      default: 'BALANCED_STRIKER',
    },
  },
  { _id: false }
);

const playerSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      default: 'CYBER_OPERATIVE',
      trim: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    exp: {
      type: Number,
      default: 0,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    fightingDNA: {
      type: fightingDNASchema,
      default: () => ({}),
    },
    activeBuffs: [
      {
        buffType: { type: String }, // e.g. '+20% DODGE SPEED'
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for auto win rate
playerSchema.methods.calculateWinRate = function () {
  if (this.matchesPlayed === 0) return 0;
  this.winRate = Math.round((this.wins / this.matchesPlayed) * 100);
  return this.winRate;
};

export const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
