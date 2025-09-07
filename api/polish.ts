import Replicate from 'replicate';

interface RequestBody {
  prompt: string;
}

export default async function handler(req: any, res: any) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 验证请求体
    const { prompt }: RequestBody = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Invalid prompt', detail: 'Prompt is required and must be a non-empty string' });
    }

    // 检查环境变量
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'Server configuration error', detail: 'REPLICATE_API_TOKEN not configured' });
    }

    // 初始化 Replicate
    const replicate = new Replicate({ auth: apiToken });
    const model = process.env.REPLICATE_LLM_MODEL || 'openai/gpt-5';

    // 组装提示词
    const instruction = `
      You are a prompt engineer for text-to-image. Improve the following prompt for a photorealistic image.
      Keep the user's intent, be concise, avoid camera brand names. Reply with the final English prompt only.
    `;

    // 调用模型
    const text = await replicate.run(model, {
      input: { prompt: `${instruction}\n\nUser: ${prompt}` }
    });

    // 处理返回结果
    const out = Array.isArray(text) ? text.join(' ').trim() : String(text).trim();

    return res.status(200).json({ prompt: out });

  } catch (error: any) {
    console.error('Polish API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      detail: error.message || 'Unknown error occurred' 
    });
  }
}