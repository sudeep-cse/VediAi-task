import { Schema, model, models, Model, InferSchemaType, Types } from 'mongoose';

const QuestionTypeSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [QuestionTypeSchema],
      required: true,
      validate: [(v: unknown[]) => v.length > 0, 'At least one question type is required'],
    },
    additionalInfo: { type: String, trim: true, default: '' },
    sourceText: { type: String, default: '' },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    // Convenience link to the latest generated paper.
    latestPaper: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper' },
  },
  { timestamps: true },
);

export type AssignmentDoc = InferSchemaType<typeof AssignmentSchema> & {
  _id: Types.ObjectId;
};

export const Assignment: Model<AssignmentDoc> =
  (models.Assignment as Model<AssignmentDoc>) ||
  model<AssignmentDoc>('Assignment', AssignmentSchema);
