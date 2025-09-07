import Replicate from 'replicate';

// Portrait风格提示词映射
const PORTRAIT_STYLE_PROMPTS: Record<string, string> = {
  Mono: `A completely new artistic reconstruction of a black-and-white portrait, ignoring the original photograph's background and pose.
The subject is depicted in a new, introspective posture, captured in a moment of pensive thought, with their face artfully obscured or turned away to evoke mystery and elegance. Their form is sculpted by a single, gentle, directional soft light, creating exquisite highlights and deep, velvety shadows that define their contours and evoke a melancholic, poetic beauty.
The background is a newly generated, softly graduated, ethereal gradient, completely devoid of any physical objects, establishing immense depth and a profoundly silent atmosphere. This creates a powerful sense of isolation and focus on the subject.
The overall composition should be fresh and non-traditional, utilizing significant negative space to amplify the subject's quiet intensity. The image must be infused with a tangible, authentic soft film grain texture, emulating classic analog photography for a vintage, tactile quality.
No text, no logos – pure light, shadow, form, and profound emotion, all completely reimagined and reconstructed.`,

  Studio: `A meticulously crafted studio portrait of the subject, captured in a moment of poised contemplation. The setting is minimalist, defined by a deep, solid black background. A single, dramatic soft side light beautifully sculpts the contours of the subject's face and upper body, creating a striking interplay of vibrant light and profound shadows.

The composition is an upper-body shot, focusing intimately on the subject, with ample negative space enhancing their presence and the scene's quiet intensity. This is a full-color photograph, characterized by rich tones and exquisite detail, evoking a sense of modern elegance and artistic depth. The lighting highlights the subject's refined features, lending an air of mystery and sophisticated beauty. No text, no logos, just pure form and emotion.`,

  Faceless: `An evocative and mysterious artistic portrait. The subject's face is intentionally obscured or turned away, allowing the focus to shift to their silhouette and posture. The lighting is dramatic and directional, creating striking rim light and deep shadows to sculpt the form. The composition is highly intentional, utilizing negative space and leading lines to guide the viewer's eye. The atmosphere is quiet and introspective, telling a story through body language alone. The overall aesthetic is clean, minimalist, and emotionally profound.`,

  Urban: `A candid and authentic street-style portrait. The subject is captured in a natural, unposed moment on a bustling city street. The background is slightly blurred with urban elements like traffic, neon signs, or old brick walls, adding a sense of place. The lighting is natural and spontaneous, reflecting the ambient light of the city. The colors are vibrant and true to life. The image has a raw, energetic feel, like a glimpse into a genuine urban story. The composition is dynamic and full of life.`,

  Vintage: `A cinematic portrait that looks like a still from a classic film. The image features a stylized color grade, with rich, nostalgic tones like teal and orange or a moody, warm palette. The lighting is purposeful and dramatic, casting deep shadows to create mystery and tension. The subject is in a pensive pose, conveying a strong emotional narrative. The composition is widescreen, with a film grain overlay and a subtle shallow depth of field to enhance the dreamy, storytelling quality.`,

  Indoor: `A cozy and intimate indoor lifestyle portrait. The setting is a comfortable, personal space like a sun-drenched bedroom or a rustic living room, filled with natural light streaming from a window. The subject is in a relaxed, candid moment, perhaps reading a book or enjoying a quiet cup of coffee. The lighting is soft and gentle, creating a warm, inviting glow. The composition is natural and easy, highlighting the genuine atmosphere of the moment. The colors are soft and muted, evoking a sense of tranquility and contentment.`,

  Film: `A completely reimagined and freshly generated full-color portrait with a classic film aesthetic. Disregard the original photograph's background and pose. 
 The image is captured in a candid, unposed moment, and infused with an authentic, organic film grain, subtle light leaks, and a touch of halation around highlights. The colors are carefully balanced to be either warmly nostalgic or quietly desaturated, creating a timeless, cinematic tone. 
 The subject is depicted with a sincere and natural expression, in a thoughtful or gentle pose within an evocative, mood-setting environment. The lighting is narrative-driven, creating a compelling interplay of light and shadow to sculpt their features and enhance the scene's emotional depth. 
 The composition is dynamic and full of life, feeling like a genuine analog photograph from any era. No text, no logos—just pure, reconstructed form, expression, and the enduring charm of a powerful visual story.`,

  Business: `A meticulously crafted professional studio portrait. The subject is a confident and composed professional, positioned against a clean, uncluttered solid color backdrop (e.g., charcoal gray, dark blue, or off-white). The lighting is expertly controlled, featuring a soft key light to gently sculpt the face, while a subtle fill light ensures no harsh shadows. The subject is dressed in sharp, classic business attire, exuding an air of sophistication and approachability. The shot is a tight headshot or upper-body portrait, focusing on the subject's clear gaze and sincere expression. The overall style is clean, modern, and high-resolution, with a shallow depth of field to keep the focus entirely on the person.`
};

export default async function handler(req: any, res: any) {
  // 仅支持 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 解析请求体
    const { style, prompt, imageBase64 } = req.body || {};

    // 验证必需参数
    if (!style || !PORTRAIT_STYLE_PROMPTS[style]) {
      return res.status(400).json({ 
        error: 'Invalid style', 
        detail: `Style must be one of: ${Object.keys(PORTRAIT_STYLE_PROMPTS).join(', ')}` 
      });
    }

    // 检查环境变量
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      console.error('[PORTRAIT] Missing REPLICATE_API_TOKEN');
      return res.status(500).json({ 
        error: 'Server configuration error', 
        detail: 'Missing Replicate API token' 
      });
    }

    // 初始化 Replicate 客户端
    const replicate = new Replicate({ auth: token });

    // 构建最终 prompt
    const basePrompt = PORTRAIT_STYLE_PROMPTS[style];
    const additionalPrompt = prompt ? ` ${prompt}` : '';
    const referencePrompt = imageBase64 ? ' Follow the reference PERSON ONLY for identity; do not reuse background.' : '';
    const finalPrompt = `${basePrompt}${additionalPrompt}${referencePrompt}`.replace(/\s+/g, ' ').trim();

    console.log('[PORTRAIT] Style:', style);
    console.log('[PORTRAIT] Final prompt:', finalPrompt);
    console.log('[PORTRAIT] Has image:', !!imageBase64);

    // 准备模型输入
    const input: any = { prompt: finalPrompt };
    if (imageBase64) {
      input.image_input = [imageBase64];
    }

    // 调用 Replicate 模型
    const modelVersion = 'google/nano-banana';
    const output = await replicate.run(modelVersion, { input });

    console.log('[PORTRAIT] Replicate output:', output);

    // 处理输出结果 - 与基础生成保持一致的处理逻辑
    let images: string[] = [];
    
    if (Array.isArray(output)) {
      images = output.filter(item => typeof item === 'string');
    } else if (typeof output === 'string') {
      images = [output];
    } else if (output && typeof output === 'object') {
      // 尝试从对象中提取 URL
      const url = (output as any).url || (output as any).image;
      if (url) {
        images = [typeof url === 'function' ? url() : url];
      }
    }

    if (images.length === 0) {
      console.error('[PORTRAIT] No valid image URLs in output:', output);
      return res.status(500).json({ 
        error: 'Generation failed', 
        detail: 'No image URLs returned from model' 
      });
    }

    console.log('[PORTRAIT] Extracted images:', images);

    // 返回结果
    return res.status(200).json({ images });

  } catch (error) {
    console.error('[PORTRAIT] Generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Portrait generation failed', 
      detail: errorMessage 
    });
  }
}