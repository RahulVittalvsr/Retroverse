import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ['text', 'image', 'button', 'form'] },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
    ui: {
      align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    },
  },
  { _id: false },
);

const VersionSchema = new mongoose.Schema(
  {
    slotNumber: { type: Number, required: true, min: 1, max: 5 },
    label: { type: String, default: '' },
    blocksSnapshot: { type: [BlockSchema], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ProjectSchema = new mongoose.Schema(
  {
    anonUserId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    blocks: { type: [BlockSchema], default: [] },
    versions: { type: [VersionSchema], default: [] },
  },
  { timestamps: true },
);

ProjectSchema.index({ anonUserId: 1, createdAt: -1 });

export const Project = mongoose.model('Project', ProjectSchema);

