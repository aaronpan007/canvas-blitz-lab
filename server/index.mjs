// server/index.js (ESM 版)
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import Replicate from "replicate";
import { existsSync } from "fs";

// 显式加载环境变量，兼容 .env.local
try {
  dotenv.config({ path: ".env.local" });
} catch (e) {
  dotenv.config();
}

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
// 增加请求体大小限制以支持 base64 图片数据
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ---- /api/polish：用 Replicate 的 LLM 做"润色"（可选） ----
app.post("/api/polish", async (req, res) => {
  console.log("[GEN] body keys:", Object.keys(req.body||{}), "file?", !!req.file);
  try {
    const src = String(req.body?.prompt || "").trim();
    if (!src) return res.json({ prompt: "" });
    const token = process.env.REPLICATE_API_TOKEN;
    const model = process.env.REPLICATE_LLM_MODEL; // 例如 openai/gpt-5:xxxx
    if (!token || !model) {
      return res.json({ prompt: src.replace(/\s+/g, " ").trim() });
    }
    const replicate = new Replicate({ auth: token });
    const sys =
      "You are a prompt engineer for image generation. Rewrite the user's prompt into concise, vivid English suitable for image models. Keep intent, avoid brand names & NSFW. Return ONLY the rewritten prompt.";
    const input = {
      prompt: `${sys}\n\nUser prompt:\n${src}\n\nRewritten prompt:`,
      max_tokens: 200,
      temperature: 0.4,
      top_p: 0.9,
    };
    const result = await replicate.run(model, { input });
    let text = "";
    if (Array.isArray(result)) text = result.join("");
    else if (typeof result === "string") text = result;
    else if (result?.output) text = String(result.output);
    const polished = (text || "").trim().replace(/^["'\s]+|["'\s]+$/g, "");
    res.json({ prompt: polished || src });
  } catch (e) {
    res.json({ prompt: String(req.body?.prompt || "").replace(/\s+/g, " ").trim() });
  }
});



// 将 base64 数据 URL 上传到 Replicate Files API
async function uploadBase64ToReplicate(base64DataUrl, replicate) {
  try {
    // 提取 base64 数据
    const base64Data = base64DataUrl.split(',')[1];
    const mimeType = base64DataUrl.split(';')[0].split(':')[1];
    
    // 转换为 Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 创建 FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('content', blob);
    
    // 上传到 Replicate Files API
    const response = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.urls.get; // 返回可访问的 URL
  } catch (error) {
    console.error('Failed to upload base64 to Replicate:', error);
    return null;
  }
}

// /api/generate 接口
app.post("/api/generate", upload.none(), async (req, res) => {
  console.log("[GEN] body keys:", Object.keys(req.body||{}), "file?", !!req.file);
  try {
    const Replicate = (await import("replicate")).default;
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const prompt = String(req.body?.prompt || "").trim();
    const ratio = String(req.body?.aspectRatio || "1:1").trim();
    const attachedImages = req.body?.attachedImages || [];
    
    if (!prompt) return res.status(400).json({ error: "Prompt 不能为空" });
    
    console.log("[GEN] attachedImages count:", attachedImages.length);
    
    const image_input = [];
    
    // 1) 历史图片（来自前端上一条模型结果）
    const history = String(req.body?.historyImage || "").trim();
    if (history) {
      image_input.push(history);
      console.log('[GEN] Added history image:', history);
    }
    
    // 2) 处理引用图片，将 base64 数据 URL 转换为 Replicate 可访问的 URL
    for (const imageUrl of attachedImages) {
      if (imageUrl.startsWith('data:')) {
        // 这是 base64 数据 URL（来自画板导出）
        console.log('[GEN] Processing base64 image...');
        const replicateUrl = await uploadBase64ToReplicate(imageUrl, replicate);
        if (replicateUrl) {
          image_input.push(replicateUrl);
          console.log('[GEN] Base64 image uploaded to:', replicateUrl);
        }
      } else if (imageUrl.startsWith('blob:')) {
        // 这是 blob URL（来自文件上传），需要跳过或处理
        console.log('[GEN] Skipping blob URL (not accessible to Replicate):', imageUrl);
        // 注意：blob URL 无法直接传递给 Replicate，需要前端发送实际文件数据
      } else {
        // 这是普通的 HTTP URL
        image_input.push(imageUrl);
      }
    }
    
    console.log("[GEN] total image_input count:", image_input.length);
    
    const finalPrompt = `${prompt}\n(aspect ratio: ${ratio})`;
    const input = { prompt: finalPrompt };
    if (image_input.length) input.image_input = image_input;
    
    console.log("[GEN] sending to replicate with", image_input.length, "reference images");
    const output = await replicate.run("google/nano-banana", { input });
    console.log("[GEN] nano-banana output:", output);
    
    // nano-banana 模型返回的是 URL 数组
    let url;
    if (Array.isArray(output) && output.length > 0) {
      url = output[0]; // 取第一个图片 URL
    } else if (typeof output === 'string') {
      url = output; // 直接是 URL 字符串
    } else if (output?.url) {
      url = typeof output.url === 'function' ? output.url() : output.url;
    }
    
    if (!url) return res.status(500).json({ error: "未能获取输出 URL", raw: output });
    return res.json({ image: url });
  } catch (e) {
    console.error("[GEN ERROR]", e);
    return res.status(500).json({ error: e?.message || "生成失败" });
  }
});

// 健康检查路由
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    node: process.version,
    hasToken: !!process.env.REPLICATE_API_TOKEN,
    llm: process.env.REPLICATE_LLM_MODEL || null
  });
});

const PORT = process.env.API_PORT || 8787;
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));