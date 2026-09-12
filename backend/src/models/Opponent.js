import mongoose from 'mongoose';

const opponentSchema = new mongoose.Schema(
  {
    opponentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    codename: {
      type: String,
      default: 'CYBER_GLADIATOR',
    },
    title: {
      type: String,
      default: 'ADAPTIVE COMBAT SENTINEL',
    },
    archetype: {
      type: String,
      enum: ['BERSERKER', 'TURTLE', 'PHANTOM', 'TACTICIAN', 'BALANCED_STRIKER'],
      default: 'BALANCED_STRIKER',
    },
    baseHp: {
      type: Number,
      default: 100,
    },
    intelligenceTier: {
      type: String,
      default: 'APEX-HEURISTIC-FSM',
    },
    evolutionIndex: {
      type: Number,
      default: 94.7,
    },
    adaptationCount: {
      type: Number,
      default: 0,
    },
    activeCounterStrategy: {
      type: mongoose.Schema.Types.Mixed,
    },
    combatModifiers: {
      approachSpeed: { type: Number, default: 2.8 },
      retreatSpeed: { type: Number, default: 3.6 },
      dodgeSpeed: { type: Number, default: 5.0 },
      blockChance: { type: Number, default: 0.45 },
    },
  },
  {
    timestamps: true,
  }
);

export const Opponent = mongoose.models.Opponent || mongoose.model('Opponent', opponentSchema);
