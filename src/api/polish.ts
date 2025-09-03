import Replicate from 'replicate';

/**
 * Prompt润色函数
 * @param prompt 原始prompt
 * @returns 润色后的prompt
 */
export async function polishPrompt(prompt: string): Promise<string> {
  const src = String(prompt ?? "").trim();
  if (!src) return "";

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
    return src.replace(/\s+/g, " ").trim();
  }

  try {
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
    return polished || src;
  } catch (err) {
    console.error('Polish prompt error:', err);
    // 出错就返回基础清洗版
    return src.replace(/\s+/g, " ").trim();
  }
}

/**
 * 处理POST请求的函数
 * @param requestBody 请求体
 * @returns 响应数据
 */
export async function handlePolishRequest(requestBody: any): Promise<{ prompt: string }> {
  const body = requestBody || {};
  const prompt = await polishPrompt(body.prompt);
  return { prompt };
}

/**
 * 模拟API调用的函数（用于前端直接调用）
 * @param prompt 原始prompt
 * @returns 润色后的结果
 */
export async function callPolishAPI(prompt: string): Promise<{ prompt: string }> {
  try {
    const polished = await polishPrompt(prompt);
    return { prompt: polished };
  } catch (error) {
    console.error('Polish API error:', error);
    return { prompt: prompt.replace(/\s+/g, " ").trim() };
  }
}