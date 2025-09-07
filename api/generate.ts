import Replicate from 'replicate';

// Vercel Serverless函数 - 基础图像生成API
export default async function handler(req: any, res: any) {
  // 仅支持POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed', 
      detail: 'Only POST requests are supported'
    });
  }

  try {
    // 检查环境变量
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error('[API] Missing REPLICATE_API_TOKEN environment variable');
      return res.status(500).json({
        error: 'Server configuration error', 
        detail: 'REPLICATE_API_TOKEN not configured'
      });
    }

    // 解析请求体
    const { prompt, imageBase64 } = req.body;

    // 验证必填字段
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Invalid input', 
        detail: 'prompt is required and must be a non-empty string'
      });
    }

    // 初始化Replicate客户端
    const replicate = new Replicate({ auth: apiToken });

    // 准备模型输入
    const input: any = {
      prompt: prompt.trim()
    };

    // 处理base64图片上传到Replicate Files API
    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.startsWith('data:')) {
      try {
        console.log('[API] Processing base64 image upload...');
        const replicateUrl = await uploadBase64ToReplicate(imageBase64, apiToken);
        if (replicateUrl) {
          // 根据现有代码，基础生成使用image_input字段
          input.image_input = [replicateUrl];
          console.log('[API] Base64 image uploaded to Replicate:', replicateUrl);
        }
      } catch (uploadError) {
        console.error('[API] Failed to upload base64 image:', uploadError);
        return res.status(400).json({
          error: 'Image upload failed', 
          detail: 'Failed to upload reference image to Replicate'
        });
      }
    }

    console.log('[API] Calling Replicate with model: google/nano-banana');
    console.log('[API] Input:', { ...input, image_input: input.image_input ? '[IMAGE_URLS]' : undefined });

    // 调用Replicate模型 - 使用现有代码中的准确模型标识
    const output = await replicate.run('google/nano-banana', { input });
    
    console.log('[API] Replicate output:', output);

    // 处理输出结果 - 统一返回数组格式
    let images: string[] = [];
    
    if (Array.isArray(output)) {
      // 如果返回数组，直接使用
      images = output.filter(item => typeof item === 'string');
    } else if (typeof output === 'string') {
      // 如果返回单个字符串，包装成数组
      images = [output];
    } else if (output && typeof output === 'object') {
      // 如果返回对象，尝试提取URL
      const outputObj = output as any;
      const url = outputObj.url || outputObj.image || String(output);
      if (url) {
        images = [url];
      }
    }

    if (images.length === 0) {
      console.error('[API] No valid image URLs in output:', output);
      return res.status(500).json({
        error: 'Generation failed', 
        detail: 'No image URLs returned from model'
      });
    }

    // 返回成功结果
    return res.status(200).json({ images });

  } catch (error) {
    console.error('[API] Generation error:', error);
    
    // 处理不同类型的错误
    let errorMessage = 'Unknown error occurred';
    let errorDetail = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('authentication') || error.message.includes('token')) {
        errorDetail = 'Invalid or missing Replicate API token';
      } else if (error.message.includes('model')) {
        errorDetail = 'Model not found or invalid model version';
      } else if (error.message.includes('input')) {
        errorDetail = 'Invalid input parameters for the model';
      }
    }

    return res.status(500).json({
      error: errorMessage, 
      detail: errorDetail || errorMessage
    });
  }
}

// 上传base64图片到Replicate Files API
async function uploadBase64ToReplicate(base64DataUrl: string, apiToken: string): Promise<string> {
  try {
    // 提取base64数据和MIME类型
    const [header, base64Data] = base64DataUrl.split(',');
    const mimeType = header.split(';')[0].split(':')[1];
    
    // 转换为Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 创建FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('content', blob);
    
    // 上传到Replicate Files API
    const response = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate Files API error: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    return result.urls.get; // 返回可访问的URL
    
  } catch (error) {
    console.error('Base64 upload error:', error);
    throw error;
  }
}