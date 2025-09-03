// API路由处理器 - 适用于Vite项目
// 这个文件可以配合Express或其他后端框架使用

import Replicate from 'replicate';

// 注意：由于这是Vite项目而非Next.js，这个文件主要作为参考
// 实际使用时需要配合Express或其他后端框架

interface GenerateInput {
  prompt: string;
  aspectRatio?: string;
  image?: string; // Replicate文件URL
}

// 初始化Replicate客户端
const getReplicateClient = () => {
  const token = import.meta.env.VITE_REPLICATE_API_TOKEN || '';
  return new Replicate({ auth: token });
};

// 上传文件到Replicate Files API
async function uploadFileToReplicate(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('content', file);

  const token = import.meta.env.VITE_REPLICATE_API_TOKEN || '';
  const response = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload file: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.urls.get;
}

// 主要的生成函数
export async function generateImage(formData: FormData): Promise<{ image?: string; error?: string }> {
  try {
    // 检查环境变量
    const apiToken = import.meta.env.VITE_REPLICATE_API_TOKEN;
    const modelVersion = import.meta.env.VITE_REPLICATE_MODEL_VERSION;
    
    if (!apiToken) {
      return { error: 'REPLICATE_API_TOKEN not configured' };
    }

    if (!modelVersion) {
      return { error: 'REPLICATE_MODEL_VERSION not configured' };
    }

    // 解析form data
    
    const prompt = formData.get('prompt') as string;
    const aspectRatio = (formData.get('aspectRatio') as string) || '1:1';
    const imageFile = formData.get('image') as File | null;
    const useCanvas = formData.get('useCanvas') as string;

    // 验证必填字段
    if (!prompt) {
      return { error: 'Prompt is required' };
    }

    // 构建完整的prompt，包含宽高比信息
    const enhancedPrompt = `${prompt} (aspect ratio: ${aspectRatio})`;

    // 准备模型输入
    const input: GenerateInput = {
      prompt: enhancedPrompt,
      aspectRatio,
    };

    // 处理图片上传
    if (imageFile && imageFile.size > 0) {
      try {
        const imageUrl = await uploadFileToReplicate(imageFile);
        input.image = imageUrl;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return { error: 'Failed to upload reference image' };
      }
    }

    // 处理画板模式
    if (useCanvas === 'true') {
      // 注意：这里需要实现画板PNG导出逻辑
      // 在实际应用中，画板数据应该作为图片文件传递
      console.log('Canvas mode enabled - canvas image should be provided as image field');
    }

    // 调用Replicate模型
    const replicate = getReplicateClient();
    console.log('Calling Replicate with input:', { 
      model: modelVersion,
      input: { ...input, image: input.image ? '[IMAGE_URL]' : undefined }
    });

    const output = await replicate.run(
      modelVersion as `${string}/${string}:${string}`,
      { input }
    );

    // 处理输出结果
    let resultImageUrl: string;
    
    if (Array.isArray(output)) {
      // 如果返回数组，取最后一个元素
      resultImageUrl = output[output.length - 1] as string;
    } else if (typeof output === 'string') {
      // 如果直接返回字符串
      resultImageUrl = output;
    } else {
      // 如果是对象，尝试获取图片URL
      resultImageUrl = (output as any).image || (output as any).url || String(output);
    }

    if (!resultImageUrl) {
      return { error: 'No image URL returned from model' };
    }

    // 返回成功结果
    return { image: resultImageUrl };

  } catch (error) {
    console.error('Generation error:', error);
    
    // 处理不同类型的错误
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return { error: 'Invalid Replicate API token' };
      }
      
      if (error.message.includes('model')) {
        return { error: 'Invalid model version or model not found' };
      }
      
      return { error: error.message };
    }

    return { error: 'Unknown error occurred during generation' };
  }
}

// 健康检查函数
export function getApiStatus() {
  return {
    status: 'ok',
    message: 'Replicate API endpoint is ready',
    hasToken: !!import.meta.env.VITE_REPLICATE_API_TOKEN,
    hasModel: !!import.meta.env.VITE_REPLICATE_MODEL_VERSION,
  };
}