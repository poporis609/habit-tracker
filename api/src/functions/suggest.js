import { app } from '@azure/functions'
import OpenAI from 'openai'

const FALLBACK = [
  { name: '아침 물 한 잔', emoji: '💧' },
  { name: '10분 스트레칭', emoji: '🧘' },
  { name: '감사 일기 쓰기', emoji: '✍️' },
]

app.http('suggest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'suggest',
  handler: async (request, context) => {
    const token = process.env.GITHUB_TOKEN

    let body = {}
    try {
      body = await request.json()
    } catch {
      // 빈 본문 허용
    }
    const existing = Array.isArray(body.existing) ? body.existing : []

    if (!token) {
      return { jsonBody: { suggestions: FALLBACK } }
    }

    const prompt = `당신은 습관 형성 전문가입니다. 사용자가 지속 가능한 새 습관 3개를 추천해주세요.
${existing.length ? `사용자가 이미 가진 습관: ${existing.join(', ')}. 이와 겹치지 않는 새로운 습관을 추천하세요.` : '건강·자기계발에 도움되는 기본 습관을 추천하세요.'}

반드시 아래 JSON 배열 형식으로만 답하세요. 다른 설명은 절대 포함하지 마세요.
[{"name":"습관 이름(10자 이내, 한국어)","emoji":"이모지 1개"}, ...]`

    try {
      const client = new OpenAI({
        baseURL: 'https://models.inference.ai.azure.com',
        apiKey: token,
      })
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      })
      const raw = completion.choices[0]?.message?.content || ''
      const match = raw.match(/\[[\s\S]*\]/)
      let suggestions = FALLBACK
      if (match) {
        try {
          const parsed = JSON.parse(match[0])
          if (Array.isArray(parsed) && parsed.length) {
            suggestions = parsed
              .filter(s => s && s.name)
              .slice(0, 3)
              .map(s => ({ name: String(s.name).slice(0, 20), emoji: String(s.emoji || '🎯').slice(0, 4) }))
          }
        } catch {
          // 파싱 실패 시 폴백 유지
        }
      }
      return { jsonBody: { suggestions } }
    } catch (err) {
      context.error(err)
      return { jsonBody: { suggestions: FALLBACK } }
    }
  },
})
