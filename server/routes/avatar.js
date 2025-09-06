import express from "express";
import { AVATAR_STYLE_PROMPTS } from "../prompts/avatar.js";

const router = express.Router();

const MODEL = process.env.REPLICATE_MODEL_VERSION || "google/nano-banana";

router.post("/generate", async (req, res) => {
  try {
    const { styleId, imageUrl, promptAddon } = req.body || {};
    console.log("[AVATAR] incoming body:", req.body);

    if (!styleId || !AVATAR_STYLE_PROMPTS[styleId]) {
      return res.status(400).json({ error: "invalid styleId" });
    }
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("[AVATAR] missing REPLICATE_API_TOKEN");
      return res.status(500).json({ error: "server missing replicate token" });
    }

    // 动态创建Replicate实例，与General功能保持一致
    const Replicate = (await import("replicate")).default;
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const base = AVATAR_STYLE_PROMPTS[styleId];
    const finalPrompt = [base, promptAddon || ''].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    const prompt = `${finalPrompt} ${
      imageUrl ? "Follow the reference PERSON ONLY for identity; do not reuse background." : ""
    }`.replace(/\s+/g, " ");

    console.log("[AVATAR] prompt:", prompt);
    console.log("[AVATAR] model:", MODEL);
    console.log("[AVATAR] imageUrl:", imageUrl || "(none)");

    const input = { prompt };
    if (imageUrl) input.image_input = [imageUrl];

    const output = await replicate.run(MODEL, { input });
    console.log("[AVATAR] replicate output:", output);
    
    // 使用与General功能完全一致的输出处理逻辑
    let url;
    if (Array.isArray(output) && output.length > 0) {
      url = output[0]; // 取第一个图片 URL
    } else if (typeof output === 'string') {
      url = output; // 直接是 URL 字符串
    } else if (output?.url) {
      url = typeof output.url === 'function' ? output.url() : output.url;
    }
    
    console.log("[AVATAR] extracted url:", url);

    if (!url) {
      console.error("[AVATAR] missing output url:", output);
      return res.status(500).json({ error: "未能获取输出 URL", raw: output });
    }
    return res.json({ image: url });
  } catch (err) {
    console.error("[AVATAR] generate error:", err);
    return res.status(500).json({ error: err?.message || "avatar generate failed" });
  }
});

export default router;