import { Schema, model, models, Model, InferSchemaType, Types } from 'mongoose';

const QuestionSchema = new Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard'],
      required: true,
    },
    marks: { type: Number, required: true },
    answer: { type: String, default: '' },
  },
  { _id: false },
);

const SectionSchema = new Schema(
  {
    id: { type: String, required: true }, // "A", "B", ...
    title: { type: String, required: true },
    instruction: { type: String, default: '' },
    questions: { type: [QuestionSchema], default: [] },
  },
  { _id: false },
);

const GeneratedPaperSchema = new Schema(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    jobId: { type: String },
    error: { type: String },

    // Structured fields — we NEVER store/return the raw model text.
    schoolName: String,
    subject: String,
    className: String,
    timeAllowed: String,
    maximumMarks: Number,
    generalInstructions: String,
    intro: String,
    sections: { type: [SectionSchema], default: [] },
    totalQuestions: Number,
    totalMarks: Number,
  },
  { timestamps: true },
);

export type GeneratedPaperDoc = InferSchemaType<typeof GeneratedPaperSchema> & {
  _id: Types.ObjectId;
};

export const GeneratedPaper: Model<GeneratedPaperDoc> =
  (models.GeneratedPaper as Model<GeneratedPaperDoc>) ||
  model<GeneratedPaperDoc>('GeneratedPaper', GeneratedPaperSchema);
