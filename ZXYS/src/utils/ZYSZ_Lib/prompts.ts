export type QwenMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "system" | "user" | "assistant"; content: any[] };

export function buildMessages(profile: {
  voice_text?: string;
  questionnaire?: unknown;
  user_goal?: string;
  tongue_image_dataurl?: string | null;
  tongue_image_url?: string | null;
}): QwenMessage[] {
  const contentList: any[] = [];

  const voice = profile?.voice_text || "";
  contentList.push({ type: "text", text: `【主观描述】${voice || "无"}` });

  const questionnaire = profile?.questionnaire ?? {};
  let qText = "";
  try {
    qText = typeof questionnaire === "string" ? questionnaire : JSON.stringify(questionnaire);
  } catch {
    qText = String(questionnaire);
  }
  contentList.push({ type: "text", text: `【问卷】${qText || "无"}` });

  contentList.push({ type: "text", text: `【健康目标】${profile?.user_goal || "无"}` });

  if (profile?.tongue_image_dataurl) {
    contentList.push({ type: "image_url", image_url: { url: profile.tongue_image_dataurl } });
  } else if (profile?.tongue_image_url) {
    contentList.push({ type: "image_url", image_url: { url: profile.tongue_image_url } });
  }

  contentList.push({
    type: "text",
    text:
      "请先给出【详细中医分析报告】，包括：\n" +
      "一、舌苔特征\n二、舌体特征\n三、临床意义\n四、注意事项\n\n" +
      "然后在最后单独附加合法 JSON（单独一段，且必须是最后一段），格式示例：\n" +
      "{\n" +
      '  \"constitution\": \"（例如：脾虚湿盛）\",\n' +
      '  \"confidence\": 0.0-1.0,\n' +
      '  \"lifestyle_advice\": {\"sleep\":\"\", \"exercise\":\"\", \"diet\":\"\"},\n' +
      '  \"drink_recommendation\": [\"草药A 配方\", \"草药B 配方\"]\n' +
      "}\n\n" +
      "注意：正文请详细、通俗；JSON 必须合法且为最后一段。若信息不足，请在正文说明并在 JSON 中给出低置信度（如 0.2）。"
  });

  return [
    {
      role: "system",
      content:
        "你是一位经验丰富的中医师，擅长舌诊与体质辨识。" +
        "请基于用户提供的舌象图片（若有）、主诉、问卷和目标，输出详尽分析并在末尾附带 JSON 汇总。"
    },
    { role: "user", content: contentList }
  ];
}

