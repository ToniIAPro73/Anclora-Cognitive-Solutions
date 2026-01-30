import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { projectId, prompt, language } = body

    if (!projectId || !prompt) {
      return NextResponse.json({ error: 'Missing projectId or prompt' }, { status: 400 })
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'

    const response = await fetch(`${aiServiceUrl}/generate-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        prompt,
        language: language || 'es',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'AI Service error')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('AI Route Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
