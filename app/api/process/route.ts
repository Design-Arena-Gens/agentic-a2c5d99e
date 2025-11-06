import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractMainTextFromUrl } from "@/src/lib/extract";
import { generateImageBase64, summarizeFinancePortuguese, transcribePortugueseFromUrl } from "@/src/lib/openai";
import { postToBlogger } from "@/src/lib/blogger";

const Schema = z.object({
  sourceType: z.enum(["text", "link", "audio"]),
  text: z.string().optional(),
  link: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  publish: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceType, text, link, audioUrl, publish } = Schema.parse(body);

    let contentRaw = "";
    if (sourceType === "text") {
      if (!text || text.trim().length < 10) throw new Error("Texto insuficiente");
      contentRaw = text.trim();
    } else if (sourceType === "link") {
      if (!link) throw new Error("Link ausente");
      contentRaw = await extractMainTextFromUrl(link);
    } else if (sourceType === "audio") {
      if (!audioUrl) throw new Error("audioUrl ausente");
      contentRaw = await transcribePortugueseFromUrl(audioUrl);
    }

    const summary = await summarizeFinancePortuguese(contentRaw);

    // Generate image (fallback to Unsplash-like service if fails)
    const imgPrompt = summary.imagePrompt || `ilustra??o moderna sobre finan?as: ${summary.title}`;
    const b64 = await generateImageBase64(imgPrompt);
    let imageUrl: string | undefined;
    if (b64) {
      imageUrl = `data:image/png;base64,${b64}`;
    } else {
      const seed = process.env.FALLBACK_IMAGE_SEED || "financas";
      imageUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`;
    }

    // Compose HTML with image on top and summary HTML below
    const html = `
      <div style="max-width:720px;margin:0 auto">
        <p><img src="${imageUrl}" alt="imagem do post" style="width:100%;height:auto;border-radius:12px"/></p>
        ${summary.html}
      </div>
    `;

    let blogger: any = null;
    if (publish) {
      try {
        blogger = await postToBlogger({ title: summary.title, html, labels: summary.tags, isDraft: false });
      } catch (e: any) {
        // include hint if posting fails
        blogger = { error: e.message || String(e) };
      }
    }

    return NextResponse.json({
      title: summary.title,
      html,
      tags: summary.tags || [],
      imageUrl,
      blogger,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro" }, { status: 400 });
  }
}
