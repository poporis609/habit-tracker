import { app } from '@azure/functions'
import OpenAI from 'openai'

const PROMPTS = {
  expand: (text) =>
    `당신은 감성적인 일기 작가입니다. 아래 일기 내용을 원본의 감정과 맥락을 유지하면서 더 풍부하고 감성적으로 확장해주세요. 3~4배 길이로 작성하고 한국어로 답변해주세요:\n\n${text}`,
  summarize: (text) =>
    `아래 일기 내용을 핵심 감정과 사건 중심으로 3~4문장으로 간결하게 요약해주세요. 한국어로 답변해주세요:\n\n${text}`,
}

app.http('ai', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ai',
  handler: async (request, context) => {
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      return { jsonBody: { result: '⚠️ GITHUB_TOKEN이 설정되지 않았습니다.' } }
    }

    let body
    try {
      body = await request.json()
    } catch {
      return { status: 400, jsonBody: { error: '잘못된 요청입니다.' } }
    }

    const { text, action } = body

    if (!text || !PROMPTS[action]) {
      return { status: 400, jsonBody: { error: '잘못된 요청입니다.' } }
    }

    try {
      const client = new OpenAI({
        baseURL: 'https://models.inference.ai.azure.com',
        apiKey: token,
      })

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: PROMPTS[action](text) }],
        max_tokens: 1200,
      })

      const result = completion.choices[0]?.message?.content || '응답을 받지 못했습니다.'
      return { jsonBody: { result } }
    } catch (err) {
      context.error(err)
      return { status: 500, jsonBody: { result: `오류가 발생했어요: ${err.message}` } }
    }
  },
})
