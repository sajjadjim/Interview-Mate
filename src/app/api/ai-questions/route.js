import { NextResponse } from "next/server";

const BASE_TEMPLATES = [
  "Can you briefly introduce yourself related to TOPIC?",
  "Why are you interested in working in TOPIC?",
  "Tell me about a project or task you have done in TOPIC.",
  "What is one challenge you faced in TOPIC and how did you handle it?",
  "What is one skill that is very important in TOPIC and why?",
  "How do you keep yourself updated or keep learning in TOPIC?",
  "Tell me about a time you worked in a team and used TOPIC skills.",
  "What is a mistake you made in TOPIC and what did you learn from it?",
  "How do you handle pressure or deadlines in work related to TOPIC?",
  "Where do you see yourself in the next 2–3 years in TOPIC?",
];

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const topic = body?.topic || "this field";
    const prompt = body?.prompt || "";

    const topicName = topic;
    const focusSuffix = prompt
      ? ` (Focus more on: ${prompt.trim()})`
      : "";

    const text = BASE_TEMPLATES.map((tpl, idx) => {
      const q = tpl.replace(/TOPIC/g, topicName);
      // Add the HR custom note to the first question to remind them
      if (idx === 0 && focusSuffix) {
        return `${idx + 1}. ${q}${focusSuffix}`;
      }
      return `${idx + 1}. ${q}`;
    }).join("\n");

    return NextResponse.json({ text });
  } catch (err) {
    console.error("ai-questions route error:", err);
    return NextResponse.json(
      {
        text:
          "Question generator is temporarily unavailable. Please prepare some manual questions.",
      },
      { status: 500 }
    );
  }
}
