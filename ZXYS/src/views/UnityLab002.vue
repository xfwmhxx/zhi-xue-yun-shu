<template>
  <div>
    <div v-if="aiLoading" class="ai-loading">
      <div class="loading-text">AI正在生成引导内容...</div>
    </div>

    <VisualNovelGuide
      v-if="scenes.length > 0"
      ref="vnGuide"
      :scenes="scenes"
      :typing-speed="50"
      :auto-start="false"
      @complete="onComplete"
      @close="onClose"
      @option-selected="onOptionSelected"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import VisualNovelGuide from './UnityLab002/VisualNovelGuide.vue'
import bg from '@/assets/VisualNovel/bg.png'
import p1 from '@/assets/VisualNovel/p1.png'
import k2 from '@/assets/VisualNovel/k2.png'
import b1 from '@/assets/VisualNovel/b1.png'
import z1 from '@/assets/VisualNovel/z1.png'
import s1 from '@/assets/VisualNovel/s1.png'
import mai from '@/assets/VisualNovel/mai.svg'

const router = useRouter()
const vnGuide = ref(null)
const aiLoading = ref(false)

// 存储用户的选择
const userChoices = ref({
  tongue: null,
  pulse: null,
  acupuncture: null,
  prescription: null,
})

// 完整的默认场景配置（包含选择题，当AI失败时使用）
const defaultScenes = [
  // ==================== 场景1：患者到来 ====================
  {
    background: bg,
    characterName: '系统提示',
    text: '叮咚——诊所的门被轻轻推开...',
    character: {
      name: '场景',
      image: p1,
      position: 'center',
      size: 400,
      offsetY: 150,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '医生您好，我最近总是感觉头晕乏力，晚上睡不好觉，已经持续两周了。',
    character: {
      name: '患者',
      image: p1,
      position: 'center',
      size: 450,
      offsetY: 160,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '请坐，慢慢说。除了头晕乏力，还有其他不适吗？比如胃口怎么样？',
    character: {
      name: '医生',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '胃口不太好，有时候会觉得恶心。而且最近工作压力大，经常加班到很晚。',
    character: {
      name: '患者',
      image: p1,
      position: 'center',
      size: 450,
      offsetY: 160,
    },
  },

  // ==================== 场景2：舌诊观察（选择题） ====================
  {
    background: bg,
    characterName: '李医生',
    text: '让我先看看您的情况。请伸出舌头，我观察一下舌象。',
    character: {
      name: '医生',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '舌诊图像',
    text: '【舌诊观察】请仔细观察舌象特征',
    character: {
      name: '舌象',
      image: s1,
      position: 'center',
      size: 600,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '根据舌象观察，您认为这是什么表现？',
    character: {
      name: '医生',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
    options: [
      {
        id: 'tongue1',
        text: '舌质红，苔黄燥',
        correct: false,
        feedback: '不对哦，再仔细观察舌象图片',
      },
      {
        id: 'tongue2',
        text: '舌质淡胖，苔白腻，边有齿痕',
        correct: true,
        feedback: '正确！这是典型的脾虚湿盛舌象：舌淡胖、苔白腻、边有齿痕',
      },
      {
        id: 'tongue3',
        text: '舌质红绛，苔少或无苔',
        correct: false,
        feedback: '不完全正确，这更偏向阴虚表现',
      },
    ],
  },
  {
    background: bg,
    characterName: '李医生',
    text: '很好！舌质淡胖、苔白腻、边有齿痕，结合面色偏黄，这是典型的脾虚湿盛的表现。',
    character: {
      name: '医生',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '系统提示',
    text: '【望诊分析】\n面色萎黄提示脾虚气血不足；\n舌质淡胖、边有齿痕提示脾虚；\n舌苔白腻提示湿浊内停。',
    character: {
      name: '诊断系统',
      image: b1,
      position: 'center',
      size: 525,
      offsetY: 300,
    },
  },

  // ==================== 场景3：脉诊问诊（选择题） ====================
  {
    background: bg,
    characterName: '李医生',
    text: '现在为您把脉，请把手伸出来。',
    character: {
      name: '医生',
      image: b1,
      position: 'center',
      size: 525,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '脉诊示意图',
    text: '【脉诊示意】濡脉特征：浮而细软，如絮浮水',
    character: {
      name: '脉象图',
      image: mai,
      position: 'center',
      size: 525,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '脉象濡缓，沉取无力。结合舌象和症状，这是什么证候？',
    character: {
      name: '医生',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
    options: [
      {
        id: 'pulse1',
        text: '肝火上炎证',
        correct: false,
        feedback: '不对，患者没有口苦、目赤等症状',
      },
      {
        id: 'pulse2',
        text: '脾虚湿困证',
        correct: true,
        feedback: '正确！脾虚湿困，清阳不升导致头晕乏力',
      },
      {
        id: 'pulse3',
        text: '肾阴虚证',
        correct: false,
        feedback: '不完全对，患者没有腰膝酸软、潮热盗汗',
      },
    ],
  },
  {
    background: bg,
    characterName: '李医生',
    text: '您判断得很准确。这是脾虚湿困，清阳不升的证候。',
    character: {
      name: '医生',
      image: b1,
      position: 'center',
      size: 525,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '医生，这是什么意思？严重吗？',
    character: {
      name: '患者',
      image: p1,
      position: 'center',
      size: 450,
      offsetY: 160,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '不用太担心，主要是长期劳累导致脾胃功能失调，运化水湿的能力下降。调理一段时间就会好转。',
    character: {
      name: '医生',
      image: p1,
      position: 'right',
      size: 300,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '我再问几个问题：平时大便怎么样？会不会觉得身体沉重？',
    character: {
      name: '医生',
      image: p1,
      position: 'center',
      size: 350,
      offsetY: 150,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '大便经常不成形，而且总觉得浑身没劲，像背着东西一样。',
    character: {
      name: '患者',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '这就对了，都是脾虚湿盛的典型症状。',
    character: {
      name: '医生',
      image: p1,
      position: 'right',
      size: 300,
      offsetY: 170,
    },
  },

  // ==================== 场景4：针灸治疗（选择题） ====================
  {
    background: bg,
    characterName: '李医生',
    text: '除了中药调理，我建议配合针灸治疗。您知道对于脾虚湿盛，应该选择哪些穴位吗？',
    character: {
      name: '医生',
      image: z1,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
    options: [
      {
        id: 'acu1',
        text: '合谷、曲池、太阳穴',
        correct: false,
        feedback: '这些穴位主要用于治疗头痛、发热，不是最佳选择',
      },
      {
        id: 'acu2',
        text: '足三里、三阴交、中脘、脾俞',
        correct: true,
        feedback: '正确！这些穴位能健脾益气、化湿和胃',
      },
      {
        id: 'acu3',
        text: '涌泉、太溪、肾俞',
        correct: false,
        feedback: '这些穴位主要用于补肾，不完全对症',
      },
    ],
  },
  {
    background: bg,
    characterName: '李医生',
    text: '非常专业！足三里、三阴交、中脘、脾俞正是治疗脾虚湿盛的要穴。',
    character: {
      name: '医生',
      image: z1,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '针灸会疼吗？我有点怕针...',
    character: {
      name: '患者',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '请放心，针灸用的毫针非常细，像头发丝一样，大部分患者只有轻微的酸胀感，不会很疼。',
    character: {
      name: '医生',
      image: z1,
      position: 'right',
      size: 450,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '系统提示',
    text: '【穴位解析】\n足三里：强壮要穴，健脾益气\n三阴交：调理肝脾肾三经\n中脘：和胃降逆，健脾化湿\n脾俞：直接补益脾脏功能',
    character: {
      name: '针灸系统',
      image: z1,
      position: 'center',
      size: 525,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '（医生取出毫针，消毒后开始施针）现在开始治疗，请放松...',
    character: {
      name: '医生',
      image: z1,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '针已经扎好了，留针20分钟。您会感觉到穴位处有酸、麻、胀的感觉，这是得气，说明有效果了。',
    character: {
      name: '医生',
      image: z1,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '嗯...确实有点酸胀的感觉，但没有想象中那么可怕。',
    character: {
      name: '患者',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '系统提示',
    text: '【针灸原理】针灸通过刺激特定穴位，调节经络气血，扶正祛邪。对于脾虚湿盛，可以健脾化湿，提升阳气。',
    character: {
      name: '教学系统',
      image: z1,
      position: 'center',
      size: 525,
      offsetY: 300,
    },
  },

  // ==================== 场景5：开方治疗（选择题） ====================
  {
    background: bg,
    characterName: '李医生',
    text: '现在需要为您开方。针对脾虚湿盛，您认为哪个方剂最合适？',
    character: {
      name: '医生',
      image: k2,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
    options: [
      { id: 'rx1', text: '龙胆泻肝汤', correct: false, feedback: '这个方主要用于肝胆湿热，不对症' },
      {
        id: 'rx2',
        text: '参苓白术散',
        correct: true,
        feedback: '正确！参苓白术散是健脾渗湿的代表方',
      },
      {
        id: 'rx3',
        text: '六味地黄丸',
        correct: false,
        feedback: '这个是滋补肾阴的方剂，不完全对症',
      },
    ],
  },
  {
    background: bg,
    characterName: '李医生',
    text: '很好，参苓白术散正是健脾益气、化湿和胃的良方。',
    character: {
      name: '医生',
      image: k2,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '处方：参苓白术散加减。\n党参15g、白术12g、茯苓15g、山药15g\n薏苡仁20g、砂仁6g、陈皮9g、甘草6g',
    character: {
      name: '医生',
      image: k2,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '系统提示',
    text: '【方解】党参、白术、茯苓健脾益气；山药、薏苡仁健脾渗湿；砂仁、陈皮理气和胃；甘草调和诸药。',
    character: {
      name: '药方系统',
      image: k2,
      position: 'right',
      size: 480,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '这个方子先服用7天，每天一剂，水煎服。服药期间注意休息，避免生冷油腻食物。',
    character: {
      name: '医生',
      image: k2,
      position: 'center',
      size: 570,
      offsetY: 300,
    },
  },
  {
    background: bg,
    characterName: '张先生',
    text: '好的医生，我一定按时服药和针灸。还有什么需要注意的吗？',
    character: {
      name: '患者',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '建议您适当运动，比如散步、太极拳，可以促进气血运行。饮食上多吃山药、薏米、小米等健脾食物。',
    character: {
      name: '医生',
      image: p1,
      position: 'right',
      size: 300,
      offsetY: 170,
    },
  },

  // ==================== 场景6：患者离去 ====================
  {
    background: bg,
    characterName: '张先生',
    text: '谢谢医生！我会注意的。下周再来复诊。',
    character: {
      name: '患者',
      image: p1,
      position: 'center',
      size: 420,
      offsetY: 160,
    },
  },
  {
    background: bg,
    characterName: '李医生',
    text: '不客气，祝您早日康复！记得按时复诊。',
    character: {
      name: '医生',
      image: p1,
      position: 'left',
      size: 280,
      offsetY: 170,
    },
  },
  {
    background: bg,
    characterName: '系统提示',
    text: '患者起身道谢，缓缓离开诊室。\n本次问诊结束。',
    character: {
      name: '场景',
      image: p1,
      position: 'center',
      size: 400,
      offsetY: 150,
    },
  },
  {
    background: bg,
    characterName: '智学云枢',
    text: '恭喜您完成了一次交互式中医诊疗学习！\n通过望闻问切、舌诊观察、脉诊辨识、针灸治疗、辨证论治、开具处方的完整流程，您已经掌握了脾虚湿盛证的中医诊疗要点。',
    character: {
      name: '教学系统',
      image: p1,
      position: 'center',
      size: 350,
      offsetY: 150,
    },
  },
]

const scenes = ref([...defaultScenes])

// AI生成场景配置（强制包含选择题）
const generateScenesWithAI = async (userPrompt) => {
  aiLoading.value = true

  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '' // 请替换为你自己的 DeepSeek API Key

    const systemPrompt = `你是一个中医教育平台的视觉小说剧本作家。请根据用户需求生成交互式问诊流程场景配置。

【最重要：必须包含选择题！】
你必须在舌诊、脉诊、针灸、开方这四个环节各生成一个选择题，总共至少4个选择题。

【选择题格式】
{
  "options": [
    {"id": "唯一标识", "text": "选项文字", "correct": true/false, "feedback": "选择后的反馈"}
  ]
}

【图片使用规则】
- 舌诊/望诊时 → 使用 ${s1}
- 脉诊/把脉时 → 使用 ${mai} 或 ${b1}
- 针灸治疗时 → 使用 ${z1}
- 开方/写处方时 → 使用 ${k2}
- 普通对话场景 → 使用 ${p1}

【图片偏移量规则】
- ${p1}: offsetY = 150-170
- ${mai}: offsetY = 400
- 其他所有图片: offsetY = 300

【图片尺寸】
- ${s1}: size = 1000
- ${mai}: size = 800
- ${b1}: size = 1000
- ${z1}: size = 1000
- ${k2}: size = 1000
- ${p1}: size = 280-450

【必须包含的环节】
1. 患者到来（使用${p1}）
2. 舌诊观察：展示${s1}图片 + 必须包含选择题
3. 脉诊问诊：展示${mai}或${b1}图片 + 必须包含选择题
4. 针灸治疗：展示${z1}图片 + 必须包含选择题
5. 开方治疗：展示${k2}图片 + 必须包含选择题
6. 患者离去（使用${p1}）

【输出格式】
请直接返回JSON数组，不要有任何其他文字。每个场景对象格式如下：
{
  "background": "${bg}",
  "characterName": "角色名称",
  "text": "对话内容",
  "character": {
    "name": "角色名",
    "image": "图片路径",
    "position": "left/center/right",
    "size": 数字,
    "offsetY": 数字
  }
}
如果是选择题场景，需要添加"options"数组。

请开始生成：`

    const userMessage = `请生成一个完整的中医问诊视觉小说剧本，必须严格按照以下要求：

1. 患者到来场景：使用${p1}人物图片，offsetY=160
2. 舌诊观察环节：必须包含一个选择题，使用${s1}舌诊图片，offsetY=300，size=1000
3. 脉诊环节：必须包含一个选择题，使用${mai}脉诊示意图，offsetY=400，size=800
4. 针灸环节：必须包含一个选择题，使用${z1}针灸图片，offsetY=300，size=1000
5. 开方环节：必须包含一个选择题，使用${k2}开方图片，offsetY=300，size=1000
6. 患者离去场景：使用${p1}人物图片，offsetY=160

请确保生成的选择题选项有3-4个，包含正确和错误选项，并提供反馈信息。
请生成大约15-20个场景，其中必须包含4个选择题（舌诊、脉诊、针灸、开方各一个）。`

    console.log('正在请求AI生成场景...')

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 5000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API错误详情:', errorData)
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('AI响应成功')

    let content = data.choices[0].message.content
    console.log('原始AI返回内容长度:', content.length)
    console.log('原始AI返回内容前500字符:', content.substring(0, 500))

    // 清理内容，提取JSON
    let cleanedContent = content.trim()
    cleanedContent = cleanedContent.replace(/```json\s*/gi, '')
    cleanedContent = cleanedContent.replace(/```\s*/g, '')

    // 尝试提取JSON数组
    let jsonMatch = null
    const arrayMatch = cleanedContent.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      jsonMatch = arrayMatch[0]
    }

    if (!jsonMatch) {
      console.error('无法提取JSON数组，使用默认配置')
      scenes.value = [...defaultScenes]
      return false
    }

    console.log('提取的JSON长度:', jsonMatch.length)

    let generatedScenes = null

    try {
      generatedScenes = JSON.parse(jsonMatch)
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      scenes.value = [...defaultScenes]
      return false
    }

    let scenesArray = null
    if (Array.isArray(generatedScenes)) {
      scenesArray = generatedScenes
    } else if (generatedScenes.scenes && Array.isArray(generatedScenes.scenes)) {
      scenesArray = generatedScenes.scenes
    } else {
      scenesArray = [generatedScenes]
    }

    if (scenesArray.length > 0) {
      // 定义图片配置映射
      const imageConfigMap = {
        [p1]: { defaultSize: 350, minSize: 250, maxSize: 500, defaultOffsetY: 160 },
        [k2]: { defaultSize: 570, minSize: 800, maxSize: 1000, defaultOffsetY: 400 },
        [b1]: { defaultSize: 525, minSize: 800, maxSize: 1000, defaultOffsetY: 400 },
        [z1]: { defaultSize: 570, minSize: 800, maxSize: 1000, defaultOffsetY: 400 },
        [s1]: { defaultSize: 600, minSize: 800, maxSize: 1000, defaultOffsetY: 400 },
        [mai]: { defaultSize: 525, minSize: 600, maxSize: 800, defaultOffsetY: 400 },
      }

      const validImages = [p1, k2, b1, z1, s1, mai]
      const validPositions = ['left', 'center', 'right']

      const validatedScenes = scenesArray.map((scene, index) => {
        let imagePath = scene.character?.image

        // 验证图片路径
        if (!imagePath || !validImages.includes(imagePath)) {
          // 根据文本内容推断应该使用的图片
          const text = (scene.text || '').toLowerCase()
          if (text.includes('舌') || text.includes('舌诊')) {
            imagePath = s1
          } else if (text.includes('脉') || text.includes('把脉')) {
            imagePath = mai
          } else if (text.includes('针') || text.includes('灸')) {
            imagePath = z1
          } else if (text.includes('开方') || text.includes('处方')) {
            imagePath = k2
          } else {
            imagePath = p1
          }
        }

        const config = imageConfigMap[imagePath] || imageConfigMap[p1]

        let finalSize = scene.character?.size || config.defaultSize
        finalSize = Math.min(config.maxSize, Math.max(config.minSize, finalSize))

        let finalOffsetY = config.defaultOffsetY

        let position = scene.character?.position || 'center'
        if (imagePath !== p1 && position !== 'center') {
          position = 'center'
        }

        return {
          background: scene.background || bg,
          characterName: scene.characterName || (imagePath === p1 ? '医生' : ''),
          text: scene.text || '...',
          character: {
            name:
              scene.character?.name ||
              (imagePath === p1
                ? '医生'
                : imagePath === s1
                  ? '舌诊'
                  : imagePath === mai
                    ? '脉诊'
                    : imagePath === z1
                      ? '针灸'
                      : imagePath === k2
                        ? '开方'
                        : '医生'),
            image: imagePath,
            position: position,
            size: finalSize,
            offsetY: finalOffsetY,
          },
          options: scene.options || undefined,
        }
      })

      // 检查是否包含选择题
      const optionsCount = validatedScenes.filter(
        (scene) => scene.options && scene.options.length > 0,
      ).length
      console.log('生成的选择题数量:', optionsCount)

      if (optionsCount < 4) {
        console.warn(`AI生成的选择题数量不足（${optionsCount}/4），使用默认配置`)
        scenes.value = [...defaultScenes]
        return false
      }

      scenes.value = validatedScenes
      console.log('✅ AI生成成功，共', scenes.value.length, '个场景')
      console.log('选择题数量:', optionsCount)
      return true
    } else {
      scenes.value = [...defaultScenes]
      return false
    }
  } catch (error) {
    console.error('❌ AI生成失败:', error.message)
    scenes.value = [...defaultScenes]
    return false
  } finally {
    aiLoading.value = false
  }
}

const generateGuideByTopic = async (topic) => {
  return await generateScenesWithAI()
}

const onComplete = () => {
  console.log('问诊流程展示完成', userChoices.value)
  const correctCount = Object.values(userChoices.value).filter((v) => v === true).length
  console.log(`答题正确数: ${correctCount}/4`)
  router.push('/Foundations/labindex')
}

const onClose = () => {
  console.log('关闭引导')
}

const onOptionSelected = (option, sceneIndex) => {
  console.log('选择了:', option, '场景索引:', sceneIndex)

  if (option.correct !== undefined) {
    // 根据选项内容判断是哪个选择题
    const text = option.text || ''
    if (text.includes('舌') || option.id?.includes('tongue')) {
      userChoices.value.tongue = option.correct
    } else if (text.includes('脾虚') || text.includes('湿困') || option.id?.includes('pulse')) {
      userChoices.value.pulse = option.correct
    } else if (text.includes('穴位') || text.includes('足三里') || option.id?.includes('acu')) {
      userChoices.value.acupuncture = option.correct
    } else if (text.includes('方') || text.includes('参苓') || option.id?.includes('rx')) {
      userChoices.value.prescription = option.correct
    }
  }

  if (option.feedback) {
    console.log('反馈:', option.feedback)
  }
}

const startGuide = () => {
  if (vnGuide.value) {
    console.log('开始展示交互式问诊流程，共', scenes.value.length, '个场景')
    const optionsScenes = scenes.value.filter((s) => s.options)
    console.log(
      '选择题场景:',
      optionsScenes.map((s) => s.characterName),
    )
    vnGuide.value.start()
  }
}

onMounted(() => {
  // 使用AI生成
  generateGuideByTopic('diagnosis').then(() => {
    setTimeout(() => startGuide(), 1000)
  })
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
})

defineExpose({
  generateScenesWithAI,
  generateGuideByTopic,
  startGuide,
  userChoices,
})
</script>

<style scoped>
.ai-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-text {
  background: white;
  padding: 20px 40px;
  border-radius: 10px;
  font-size: 18px;
  color: #333;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
