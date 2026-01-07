import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    // Link to specific application
    applicationId: { type: String, required: true },
    roomId: { type: String, required: true },

    // Candidate Info
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },

    // Interviewer Info
    interviewerName: { type: String, required: true },
    interviewerEmail: { type: String, required: true },

    // Marks / Scores
    score: { type: Number, required: true }, // e.g. 24
    maxScore: { type: Number, default: 30 },
    
    // Detailed Question Marks
    breakdown: [
      {
        id: Number,
        text: String,
        score: Number
      }
    ],

    // Date
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent model overwrite error
export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);