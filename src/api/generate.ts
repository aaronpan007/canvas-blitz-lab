import Replicate from 'replicate';

// 由于这是Vite项目，我们需要创建一个API处理函数
// 这个文件可以被前端调用或者配合后端服务使用

interface GenerateRequest {
  prompt: string;
  aspectRatio?: string;
  image?: File;
  useCanvas?: string;
}

interface GenerateResponse {
  image?: string;
  error?: string;
}

// Replicate客户端初始化
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// 上传图片到Replicate Files API
async function uploadImageToReplicate(imageFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('content', imageFile);

  const response = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const result = await response.json();
  return result.urls.get; // 返回可访问的URL
}

// 主要的生成函数
export async function generateImage(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const { prompt, aspectRatio = '1:1', image, useCanvas } = request;
    
    // 验证必填字段
    if (!prompt) {
      return { error: 'Prompt is required' };
    }

    // 验证环境变量
    if (!process.env.REPLICATE_API_TOKEN || !process.env.REPLICATE_MODEL_VERSION) {
      return { error: 'Missing required environment variables' };
    }

    // 构建完整的prompt，包含宽高比
    const fullPrompt = `${prompt} (aspect ratio: ${aspectRatio})`;

    // 准备模型输入
    const input: any = {
      prompt: fullPrompt,
    };

    // 处理图片上传（如果有的话）
    if (image) {
      try {
        const imageUrl = await uploadImageToReplicate(image);
        input.image = imageUrl;
      } catch (error) {
        console.error('Failed to upload image:', error);
        return { error: 'Failed to upload reference image' };
      }
    }

    // 如果useCanvas为"true"，这里应该处理画板导出的PNG
    // 注意：实际实现中需要从前端获取画板数据
    if (useCanvas === 'true') {
      // 这里需要实现画板PNG导出逻辑
      console.log('Canvas mode enabled - implement canvas export logic');
    }

    // 调用Replicate模型
    const output = await replicate.run(
      process.env.REPLICATE_MODEL_VERSION as `${string}/${string}:${string}`,
      { input }
    );

    // 处理返回结果
    let imageUrl: string;
    if (Array.isArray(output)) {
      // 如果返回数组，取最后一个
      imageUrl = output[output.length - 1] as string;
    } else {
      // 如果返回字符串
    const imageUrl = Array.isArray(output) ? output[output.length - 1] : (output as unknown as string);
    }

    return { image: imageUrl };

  } catch (error) {
    console.error('Generation error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Express路由处理器（如果使用Express后端）
export async function handleGenerateRequest(req: any, res: any) {
  try {
    // 解析multipart/form-data
    const { prompt, aspectRatio, image, useCanvas } = req.body;
    const imageFile = req.files?.image;

    const request: GenerateRequest = {
      prompt,
      aspectRatio,
      image: imageFile,
      useCanvas,
    };

    const result = await generateImage(request);

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Request handling error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}

// 前端调用的辅助函数
export async function callGenerateAPI(prompt: string, imageBase64?: string): Promise<{ images?: string[], error?: string }> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to call API' 
    };
  }
}