import { app } from '@azure/functions'
import OpenAI from 'openai'
import { createTextEvent, createDoneEvent } from '@copilot-extensions/preview-sdk'

const SYSTEM_PROMPT = `당신은 친근하고 따뜻한 개인 생산성 코치입니다. 사용자의 습관 데이터와 일기를 바탕으로 개인화된 조언과 응원을 제공합니다. 항상 한국어로 답변하고, 이모지를 적절히 사용하며, 200자 이내로 간결하게 답변하세요.`

app.http('chat', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'chat',
  handler: async (request, context) => {
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      return { jsonBody: { reply: '⚠️ GITHUB_TOKEN이 설정되지 않았습니다.' } }
    }

    let body
    try {
      body = await request.json()
    } catch {
      return { status: 400, jsonBody: { error: '잘못된 요청입니다.' } }
    }

    const { messages = [], habitContext = '' } = body

    try {
      const client = new OpenAI({
        baseURL: 'https://models.inference.ai.azure.com',
        apiKey: token,
      })

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n현재 사용자 데이터:\n${habitContext}` },
          ...messages,
        ],
        max_tokens: 400,
      })

      const replyText = completion.choices[0]?.message?.content || '응답을 받지 못했습니다.'

      // @copilot-extensions/preview-sdk 로 Copilot 호환 이벤트 생성
      const events = [createTextEvent(replyText), createDoneEvent()]

      return { jsonBody: { reply: replyText, events } }
    } catch (err) {
      context.error(err)
      return { status: 500, jsonBody: { reply: `오류가 발생했어요: ${err.message}` } }
    }
  },
})
