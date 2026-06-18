import { NextRequest, NextResponse } from 'next/server';

// Fallback responses when AI service is unavailable
const fallbackResponses: Record<string, string[]> = {
  greeting: [
    'مرحبًا! أنا المساعد الذكي لأحمد المطيري. كيف يمكنني مساعدتك اليوم؟',
    'أهلاً وسهلاً! أنا هنا للإجابة على أسئلتك حول أحمد ومهاراته ومشاريعه.',
  ],
  skills: [
    'أحمد متخصص في React, Next.js, TypeScript, Node.js, Python, و AWS. لديه خبرة واسعة في تطوير تطبيقات الويب المتقدمة بأكثر من 8 سنوات من الخبرة.',
  ],
  projects: [
    'أحمد أنجز أكثر من 150 مشروعًا متنوعًا تشمل تطبيقات ويب وتطبيقات موبايل وأنظمة خلفية. يمكنك الاطلاع على بعضها في قسم المشاريع.',
  ],
  experience: [
    'أحمد يمتلك أكثر من 8 سنوات من الخبرة في تطوير البرمجيات، عمل خلالها مع شركات متنوعة وقاد مشاريع تقنية ناجحة.',
  ],
  contact: [
    'يمكنك التواصل مع أحمد عبر نموذج الاتصال في الموقع أو من خلال بيانات التواصل المتاحة في قسم الاتصال.',
  ],
  default: [
    'شكرًا لسؤالك! أحمد مطور Full-Stack بخبرة تزيد عن 8 سنوات في React, Next.js, TypeScript, و Node.js. هل تريد معرفة المزيد عن مهاراته أو مشاريعه؟',
    'أنا المساعد الذكي لأحمد. يمكنني إخبارك عن خبراته ومهاراته ومشاريعه. ما الذي تود معرفته؟',
  ],
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (/مرحب|هلا|أهلا|سلام|hello|hi|hey/.test(lower)) {
    const arr = fallbackResponses.greeting;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (/مهار|skill|تقني|تكنولوج|لغة برمج/.test(lower)) {
    return fallbackResponses.skills[0];
  }
  if (/مشروع|project|عمل|أعمال/.test(lower)) {
    return fallbackResponses.projects[0];
  }
  if (/خبر|experience|سنوات|خبرة/.test(lower)) {
    return fallbackResponses.experience[0];
  }
  if (/تواصل|contact|اتصل|ايميل|email/.test(lower)) {
    return fallbackResponses.contact[0];
  }

  const arr = fallbackResponses.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Try to use z-ai-web-dev-sdk for LLM chat
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'أنت مساعد ذكي لموقع أحمد المطيري، مطور برمجيات Full-Stack. أجب على الأسئلة حول خبرات أحمد ومشاريعه ومهاراته باللغة العربية. كن مختصرًا ومفيدًا. أحمد متخصص في React, Next.js, TypeScript, Node.js, Python, AWS. لديه 8+ سنوات خبرة وأكثر من 150 مشروع.',
          },
          { role: 'user', content: message },
        ],
        thinking: { type: 'disabled' },
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (responseContent) {
        return NextResponse.json({ response: responseContent });
      }
    } catch (sdkError) {
      console.error('AI SDK error, using fallback:', sdkError);
    }

    // Fallback response
    const fallback = getFallbackResponse(message);
    return NextResponse.json({ response: fallback });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: 'عذرًا، حدث خطأ. يرجى المحاولة لاحقًا.' },
      { status: 500 }
    );
  }
}
