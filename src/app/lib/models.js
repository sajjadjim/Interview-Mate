import mongoose from "mongoose";

// 1. Existing Interviews_Candidate Schema (Reference)
const InterviewCandidateSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  applicantName: String,
  applicantEmail: String,
  // ... other fields
}, { timestamps: true });

// 2. New: Store individual interview results
const InterviewResultSchema = new mongoose.Schema({
  applicationId: String,
  applicantName: String,
  applicantEmail: String,
  questions: [{
    questionText: String,
    score: Number // 2, 3, 4, 5
  }],
  totalScore: Number, // Out of 30
  feedback: String,
}, { timestamps: true });

// 3. New: Leaderboard (Aggregated Scores)
const LeaderboardSchema = new mongoose.Schema({
  applicantName: String,
  applicantEmail: { type: String, unique: true, required: true },
  totalScoreAccumulated: { type: Number, default: 0 }, // Sum of all interview scores
  interviewsCount: { type: Number, default: 0 }, // How many interviews taken
}, { timestamps: true });

export const InterviewCandidate = mongoose.models.Interviews_Candidate || mongoose.model("Interviews_Candidate", InterviewCandidateSchema);
export const InterviewResult = mongoose.models.InterviewResult || mongoose.model("InterviewResult", InterviewResultSchema);
export const Leaderboard = mongoose.models.Leaderboard || mongoose.model("Leaderboard", LeaderboardSchema);