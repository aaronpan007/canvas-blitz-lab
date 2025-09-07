import Replicate from 'replicate';

export const runtime = "nodejs";

/**
 * POST /api/chat - General对话用的LLM调用接口
 * 基于现有的/api/polish实现，适配为通用对话功能
 */
export default async function handler(req: any, res: any) {
  // 只支持POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', detail: 'Only POST requests are supported' });
  }

  try {
    // 读取输入参数 - 与现有前端保持一致
    const body = req.body || {};
    const prompt = String(body?.prompt || "").trim();
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required', detail: 'Please provide a prompt for the conversation' });
    }

    // 从环境变量读取配置
    const token = process.env.REPLICATE_API_TOKEN;
    const model = process.env.REPLICATE_LLM_MODEL;
    
    if (!token) {
      console.error('[CHAT] Missing REPLICATE_API_TOKEN');
      return res.status(500).json({ error: 'Configuration error', detail: 'Missing API token' });
    }
    
    if (!model) {
      console.error('[CHAT] Missing REPLICATE_LLM_MODEL');
      return res.status(500).json({ error: 'Configuration error', detail: 'Missing model configuration' });
    }

    console.log('[CHAT] Processing request with model:', model);
    console.log('[CHAT] Prompt length:', prompt.length);

    const replicate = new Replicate({ auth: token });

    // 使用与现有实现一致的输入格式 - prompt格式
    const input = {
      prompt: prompt,
      max_tokens: 1000,  // 对话需要更多token
      temperature: 0.7,  // 对话需要更多创造性
      top_p: 0.9,
    };

    console.log('[CHAT] Calling Replicate with input:', { ...input, prompt: '[PROMPT_CONTENT]' });

    // 调用Replicate模型 - 与现有实现方式一致
    const result = await replicate.run(model as `${string}/${string}:${string}`, { input });
    
    console.log('[CHAT] Replicate result type:', typeof result);
    console.log('[CHAT] Replicate result:', result);

    // 处理输出结果 - 与现有实现逻辑一致
    let output = "";
    if (Array.isArray(result)) {
      // 如果返回数组，拼接成一个字符串
      output = result.join("");
    } else if (typeof result === "string") {
      // 如果直接返回字符串
      output = result;
    } else if (result && typeof result === 'object' && 'output' in result) {
      // 如果返回对象包含output字段
      output = String((result as any).output);
    } else {
      // 其他情况，尝试转换为字符串
      output = String(result || "");
    }

    // 清理输出文本
    const cleanOutput = output.trim();
    
    if (!cleanOutput) {
      console.error('[CHAT] Empty output from model');
      return res.status(500).json({ error: 'Empty response', detail: 'Model returned empty response' });
    }

    console.log('[CHAT] Final output length:', cleanOutput.length);

    // 统一返回格式：{ output: string }
    return res.status(200).json({ output: cleanOutput });

  } catch (error) {
    console.error('[CHAT] Error:', error);
    
    // 错误返回格式：{ error, detail }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetail = error instanceof Error ? error.stack : String(error);
    
    return res.status(500).json({ 
      error: errorMessage, 
      detail: errorDetail 
    });
  }
}