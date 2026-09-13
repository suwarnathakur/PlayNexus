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
    name: {
      type: String,
      default: 'CYBER_VIPER',
      trim: true,
    },
    level: {
      type: Number,
      default: 7,
    },
    xp: {
      type: Number,
      default: 3420,
    },
    xpToNextLevel: {
      type: Number,
      default: 5000,
    },
    totalMatches: {
      type: Number,
      default: 24,
    },
    matchesPlayed: {
      type: Number,
      default: 24,
    },
    wins: {
      type: Number,
      default: 16,
    },
    losses: {
      type: Number,
      default: 8,
    },
    winRate: {
      type: Number,
      default: 66.7,
    },
    currentStreak: {
      type: Number,
      default: 3,
    },
    bestStreak: {
      type: Number,
      default: 5,
    },
    totalDamage: {
      type: Number,
      default: 32480,
    },
    favoriteStyle: {
      type: String,
      default: 'HYBRID STRIKER',
    },
    adaptationScore: {
      type: Number,
      default: 91,
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
  const total = Number(this.totalMatches ?? this.matchesPlayed ?? 0);
  if (total === 0) return 0;
  this.winRate = Number(((this.wins / total) * 100).toFixed(1));
  return this.winRate;
};

export const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);
