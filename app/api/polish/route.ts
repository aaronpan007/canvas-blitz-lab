import Replicate from 'replicate';

export const runtime = "nodejs";

/**
 * POST /api/polish - Prompt润色接口
 */
export async function POST(req: Request) {
  try {
    // 读取输入并做兜底
    const body = await req.json().catch(() => ({} as any));
    const src = String(body?.prompt ?? "").trim();
    if (!src) return Response.json({ prompt: "" });

    const sys = 
      "You are a prompt engineer for image generation. " +
      "Rewrite the user's prompt into concise, vivid English suitable for image models. " +
      "Keep the intent, add camera/lighting/styling details when helpful, avoid brand names and NSFW. " +
      "Return ONLY the rewritten prompt text.";

    const token = import.meta.env.VITE_REPLICATE_API_TOKEN;
    const model = 
      import.meta.env.VITE_REPLICATE_LLM_MODEL || 
      "meta/meta-llama-3.1-70b-instruct"; // 兜底：任意可用指令模型

    // 没配 Replicate 就本地清洗
    if (!token || !model) {
      return Response.json({ prompt: src.replace(/\s+/g, " ").trim() });
    }

    const replicate = new Replicate({ auth: token });

    // 通用输入：多数指令模型接受单条 prompt；若模型需要 messages，请按需切换
    let input: Record<string, any> = {
      prompt: `${sys}\n\nUser prompt:\n${src}\n\nRewritten prompt:`,
      max_tokens: 200,
      temperature: 0.4,
      top_p: 0.9
    };

    // 如果该模型在 Replicate schema 中要求 messages 格式，请自动适配：
    // e.g. input = { messages: [{role:"system",content:sys},{role:"user",content:src}], max_tokens:200, temperature:0.4 }

    const result: any = await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, { input });

    // 兼容不同返回结构
    let text = "";
    if (Array.isArray(result)) text = result.join("");
    else if (typeof result === "string") text = result;
    else if (result?.output) text = String(result.output);

    const polished = (text || "").trim().replace(/^["'\s]+|["'\s]+$/g, "");
    return Response.json({ prompt: polished || src });
  } catch (err) {
    console.error('Polish API error:', err);
    // 出错就返回基础清洗版
    const body = await req.json().catch(() => ({} as any));
    const src = String(body?.prompt ?? "").trim();
    return Response.json({ prompt: src.replace(/\s+/g, " ").trim() });
  }
}

/**
 * GET /api/polish - 健康检查
 */
export async function GET() {
  return Response.json({ 
    status: "ok", 
    message: "Polish API is running",
    hasToken: !!import.meta.env.VITE_REPLICATE_API_TOKEN,
    hasModel: !!import.meta.env.VITE_REPLICATE_LLM_MODEL
  });
}