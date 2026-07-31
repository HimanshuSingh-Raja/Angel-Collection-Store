import { NextResponse } from 'next/server';
import { generateProductListingWithGemini } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { images, titleHint, categoryHint, notes } = body;

    console.log('🤖 [/api/admin/ai/product] Processing Gemini AI Request...');

    const result = await generateProductListingWithGemini({
      images,
      titleHint,
      categoryHint,
      notes,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('❌ [/api/admin/ai/product] Exception:', error);
    return NextResponse.json(
      { success: false, error: 'AI generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
