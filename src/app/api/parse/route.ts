
import { NextRequest, NextResponse } from "next/server";
import { extractEmails } from "@/lib/extractor";
import { aiNameAndCompanyExtraction } from "@/ai/flows/ai-name-and-company-extraction-flow";

export async function POST(req: NextRequest) {
  try {
    const { text, extractEntities = false } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const emails = extractEmails(text);
    let entities = { names: [], companies: [] };

    if (extractEntities) {
      try {
        entities = await aiNameAndCompanyExtraction({ text });
      } catch (aiError) {
        console.error("AI Extraction error:", aiError);
        // Fallback or continue without entities
      }
    }

    return NextResponse.json({
      success: true,
      emails,
      entities,
      count: emails.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
