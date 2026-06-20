import OpenAI from 'openai'
import { createTextEvent, createDoneEvent } from '@copilot-extensions/preview-sdk'

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
})

const SYSTEM_PROMPT = `당신은 친근하고 따뜻한 개인 생산성 코치입니다. 사용자의 습관 데이터와 일기를 바탕으로 개인화된 조언과 응원을 제공합니다. 항상 한국어로 답변하고, 이모지를 적절히 사용하며, 200자 이내로 간결하게 답변하세요.`

export default async function handler(context, req) {
  context.res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    context.res.status = 405
    context.res.body = JSON.stringify({ error: 'Method not allowed' })
    return
  }

  const { messages = [], habitContext = '' } = req.body || {}

  if (!process.env.GITHUB_TOKEN) {
    context.res.body = JSON.stringify({ reply: '⚠️ GITHUB_TOKEN이 설정되지 않았습니다.' })
    return
  }

  try {
    // OpenAI SDK로 GitHub Models API 호출
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\n현재 사용자 데이터:\n${habitContext}` },
        ...messages,
      ],
      max_tokens: 400,
    })

    const replyText = completion.choices[0]?.message?.content || '응답을 받지 못했습니다.'

    // @copilot-extensions/preview-sdk 로 SSE 이벤트 포맷팅
    const textEvent = createTextEvent(replyText)
    const doneEvent = createDoneEvent()

    context.res.body = JSON.stringify({ reply: replyText, events: [textEvent, doneEvent] })
  } catch (err) {
    context.res.status = 500
    context.res.body = JSON.stringify({ error: err.message })
  }
}
