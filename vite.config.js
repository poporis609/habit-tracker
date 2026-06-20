import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import OpenAI from 'openai'

function getClient(token) {
  return new OpenAI({
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey: token,
  })
}

async function callGitHubModels(token, messages, maxTokens = 1200) {
  const client = getClient(token)
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: maxTokens,
  })
  return response.choices[0]?.message?.content || '응답을 받지 못했습니다.'
}

function handleRequest(req, res, handler) {
  if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
  let body = ''
  req.on('data', c => { body += c })
  req.on('end', async () => {
    try {
      res.setHeader('Content-Type', 'application/json')
      const result = await handler(JSON.parse(body), process.env.GITHUB_TOKEN)
      res.end(JSON.stringify(result))
    } catch (e) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: e.message }))
    }
  })
}

const DEMO_RESPONSES = [
  "오늘도 정말 수고하셨어요! 습관을 꾸준히 실천하는 것 자체가 대단한 일이에요. 작은 변화들이 쌓여 큰 성장이 됩니다. 내일도 화이팅! 💪",
  "데이터를 보니 정말 잘 하고 계시네요! 꾸준함이 가장 중요한데, 지금 그걸 실천하고 있어요. 이 흐름을 유지하면 한 달 후에 놀라운 변화가 생길 거예요! ✨",
  "좋은 질문이에요! 습관 형성에는 보통 21~66일이 걸린다고 해요. 지금처럼 매일 조금씩 실천하면 어느 순간 자동으로 하게 됩니다. 믿고 계속해요! 🌱",
  "[💡 GitHub 토큰을 .env.local의 GITHUB_TOKEN에 설정하면 실제 AI 코치가 활성화됩니다!]",
]

const aiPlugin = {
  name: 'ai-api',
  configureServer(server) {
    // 일기 AI (확장/요약)
    server.middlewares.use('/api/ai', (req, res) => {
      handleRequest(req, res, async ({ text, action }, token) => {
        if (!token) {
          const demo = action === 'expand'
            ? `${text}\n\n오늘 하루를 돌아보니, 이 순간이 얼마나 소중한지 새삼 느껴졌다. 작은 일상의 조각들이 모여 삶이 된다는 것을, 오늘도 배웠다.\n\n[💡 GitHub 토큰을 설정하면 실제 AI가 작성합니다]`
            : `📝 요약: ${text.slice(0, 80)}...\n\n[💡 GitHub 토큰을 설정하면 실제 AI가 요약합니다]`
          return { result: demo }
        }
        const prompts = {
          expand: `당신은 감성적인 일기 작가입니다. 아래 일기 내용을 원본의 감정과 맥락을 유지하면서 더 풍부하고 감성적으로 확장해주세요. 3~4배 길이로 작성하고 한국어로 답변해주세요:\n\n${text}`,
          summarize: `아래 일기 내용을 핵심 감정과 사건 중심으로 3~4문장으로 간결하게 요약해주세요. 한국어로 답변해주세요:\n\n${text}`,
        }
        return { result: await callGitHubModels(token, [{ role: 'user', content: prompts[action] }]) }
      })
    })

    // AI 채팅 코치
    server.middlewares.use('/api/chat', (req, res) => {
      handleRequest(req, res, async ({ messages, habitContext }, token) => {
        if (!token) {
          return { reply: DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)] }
        }
        const systemPrompt = `당신은 친근하고 따뜻한 개인 생산성 코치입니다. 사용자의 습관 데이터와 일기를 바탕으로 개인화된 조언과 응원을 제공합니다. 항상 한국어로 답변하고, 이모지를 적절히 사용하며, 200자 이내로 간결하게 답변하세요.

현재 사용자 데이터:
${habitContext}`
        const result = await callGitHubModels(token, [
          { role: 'system', content: systemPrompt },
          ...messages
        ], 400)
        return { reply: result }
      })
    })

    // AI 주간 리포트
    server.middlewares.use('/api/report', (req, res) => {
      handleRequest(req, res, async ({ summary, moodSummary }, token) => {
        if (!token) {
          return { result: `📊 이번 주 회고 (데모)\n\n꾸준히 습관을 실천하고 계시네요! 데이터를 보면 성장의 흐름이 보여요. 다음 주에는 가장 어려웠던 습관에 조금 더 집중해보세요.\n\n[💡 GitHub 토큰을 설정하면 실제 AI가 분석합니다]` }
        }
        const prompt = `당신은 따뜻하고 통찰력 있는 생산성 코치입니다. 아래 한 주간의 습관 데이터와 기분 기록을 바탕으로 주간 회고 리포트를 작성해주세요.

[형식]
1. 이번 주 한 줄 요약 (격려 포함)
2. 잘한 점 2가지
3. 다음 주 개선 제안 2가지
이모지를 적절히 사용하고, 한국어로 따뜻하게 작성하세요. 300자 이내.

[습관 데이터]
${summary}

[기분 기록]
${moodSummary}`
        return { result: await callGitHubModels(token, [{ role: 'user', content: prompt }], 600) }
      })
    })
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.GITHUB_TOKEN = env.GITHUB_TOKEN
  return {
    plugins: [react(), tailwindcss(), aiPlugin],
  }
})
