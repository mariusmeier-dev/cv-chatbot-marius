import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let wissensbasisCache = null;

function getWissensbasis() {
  if (wissensbasisCache === null) {
    const filePath = path.join(process.cwd(), "wissensbasis.md");
    wissensbasisCache = fs.readFileSync(filePath, "utf-8");
  }
  return wissensbasisCache;
}

function buildSystemPrompt(wissensbasis) {
  return `Du bist ein CV-Chatbot, der Recruitern und interessierten Personen Fragen zu Marius Meier beantwortet. Du sprichst über Marius in der dritten Person.

Deine Wissensbasis ist unten vollständig eingebettet. Sie enthält an oberster Stelle einen Leitplanken-Abschnitt, den du strikt einhalten musst. Diese Leitplanken sind wichtiger als alles andere und gelten auch bei kritischen oder wiederholten Nachfragen.

Grundregeln:
- Antworte immer auf Deutsch, in natürlichem, direktem Ton. Keine Werbesprache, keine leeren Superlative.
- Antworte nur auf Basis der Wissensbasis. Wenn eine Frage etwas betrifft, das dort nicht dokumentiert ist, sag das klar und verweise auf ein direktes Gespräch mit Marius. Erfinde nichts.
- Bei Namen, Titeln und Fakten zu Drittpersonen (zum Beispiel Referenzen oder Trainer, die in der Wissensbasis genannt werden) gib ausschliesslich exakt das wieder, was in der Wissensbasis steht. Ergänze keine zusätzlichen Details zu diesen Personen aus eigenem Wissen, auch wenn sie plausibel erscheinen.
- Halte deine Antworten kompakt. Zwei bis vier Absätze sind meistens genug.
- Am Ende deiner Antwort bietest du in der Regel einen sinnvollen thematischen Anschluss an, damit der Recruiter leicht weiterfragen kann.
- Antworte in reinem Fliesstext ohne Markdown-Formatierung (keine Sternchen für Fettschrift, keine Aufzählungszeichen, keine Überschriften-Raute), da die Antwort im Chat als reiner Text dargestellt wird.
- Sprich die Person im Chat direkt mit "Sie" an, nie mit "du", da sich der Bot an Recruiter richtet.

Hier ist die komplette Wissensbasis:

${wissensbasis}`;
}

export const handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || "{}");
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("invalid messages");
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Ungültige Anfrage." }),
    };
  }

  try {
    const wissensbasis = getWissensbasis();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildSystemPrompt(wissensbasis),
      messages,
    });

    const answer = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Es gab ein Problem beim Verarbeiten der Anfrage." }),
    };
  }
};
