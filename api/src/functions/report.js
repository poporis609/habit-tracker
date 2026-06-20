import { app } from '@azure/functions'
import OpenAI from 'openai'

app.http('report', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'report',
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

    const { summary = '', moodSummary = '기록 없음' } = body

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

    try {
      const client = new OpenAI({
        baseURL: 'https://models.inference.ai.azure.com',
        apiKey: token,
      })

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
      })

      const result = completion.choices[0]?.message?.content || '응답을 받지 못했습니다.'
      return { jsonBody: { result } }
    } catch (err) {
      context.error(err)
      return { status: 500, jsonBody: { result: `오류가 발생했어요: ${err.message}` } }
    }
  },
})
