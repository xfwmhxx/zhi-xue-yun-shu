import type { QwenMessage } from "./prompts";

const DEFAULT_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const DEFAULT_MODEL = "qwen3-vl-plus";

function prepareMessagesForQwen(messages: QwenMessage[]) {
  const out: any[] = [];
  for (const m of messages || []) {
    const role = (m as any)?.role || "user";
    const content = (m as any)?.content ?? "";

    if (Array.isArray(content)) {
      const normList: any[] = [];
      for (const item of content) {
        if (item && typeof item === "object") normList.push(item);
        else normList.push({ type: "text", text: String(item) });
      }
      out.push({ role, content: normList });
    } else {
      out.push({ role, content: String(content || "") });
    }
  }
  return out;
}

function stringifyImageEntries(messages: any[]) {
  const out: any[] = [];
  for (const m of messages || []) {
    const role = m?.role || "user";
    const content = m?.content ?? "";
    if (Array.isArray(content)) {
      const otherTexts: string[] = [];
      const imageUrls: string[] = [];
      for (const it of content) {
        if (it && typeof it === "object" && it.type === "image_url") {
          const v = it.image_url;
          const url = v && typeof v === "object" ? v.url : v;
          if (url) imageUrls.push(url);
        } else if (it && typeof it === "object" && it.type === "text") {
          otherTexts.push(it.text || "");
        } else {
          otherTexts.push(String(it));
        }
      }
      if (otherTexts.length) out.push({ role, content: otherTexts.join("\n") });
      for (const iu of imageUrls) out.push({ role: "user", content: JSON.stringify({ image_url: iu }) });
    } else {
      out.push({ role, content: String(content || "") });
    }
  }
  return out;
}

export async function callQwen(
  messages: QwenMessage[],
  opts: { apiKey: string; baseUrl?: string; model?: string; timeoutMs?: number }
) {
  const baseUrl = opts.baseUrl || DEFAULT_BASE_URL;
  const model = opts.model || DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 120_000;

  const payloadMessages = prepareMessagesForQwen(messages);
  const payload = {
    model,
    messages: payloadMessages,
    stream: false,
    temperature: 0.2,
    max_tokens: 3000
  };

  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });

    if (resp.ok) return await resp.json();

    // 4xx: try fallback by stringifying images
    if (resp.status >= 400 && resp.status < 500) {
      const fallbackPayload = {
        ...payload,
        messages: stringifyImageEntries(payloadMessages)
      };
      const resp2 = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fallbackPayload),
        signal: ctrl.signal
      });
      if (resp2.ok) return await resp2.json();

      const d1 = await safeJson(resp);
      const d2 = await safeJson(resp2);
      throw new Error(
        JSON.stringify(
          {
            error: "AI 调用失败(两次尝试都失败)",
            status_first: resp.status,
            detail_first: d1,
            status_second: resp2.status,
            detail_second: d2
          },
          null,
          2
        )
      );
    }

    const detail = await safeJson(resp);
    throw new Error(JSON.stringify({ error: "AI 调用失败", status: resp.status, detail }, null, 2));
  } finally {
    window.clearTimeout(t);
  }
}

async function safeJson(resp: Response) {
  try {
    return await resp.json();
  } catch {
    try {
      return await resp.text();
    } catch {
      return null;
    }
  }
}

