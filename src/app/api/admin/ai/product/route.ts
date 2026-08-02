import { NextResponse } from 'next/server';
import { generateProductListingWithGemini } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ [/api/admin/ai/product SERVER LOG] Failed to parse request JSON body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Image payload may be too large.' },
        { status: 400 }
      );
    }

    const { images, titleHint, categoryHint, notes } = body || {};

    console.log('🤖 [/api/admin/ai/product SERVER LOG] Processing Gemini Multimodal AI Request...');
    console.log('🖼️ [/api/admin/ai/product SERVER LOG] Images received count:', Array.isArray(images) ? images.length : 0);

    if (!images || !Array.isArray(images) || images.length === 0 || !images[0]) {
      return NextResponse.json(
        { success: false, error: 'Please upload at least one product image before generating AI analysis.' },
        { status: 400 }
      );
    }

    const firstImg = String(images[0]);
    const isDataUri = firstImg.startsWith('data:');
    const isUrl = firstImg.startsWith('http');
    console.log(`🔍 [/api/admin/ai/product SERVER LOG] Image 1 Format: ${isDataUri ? 'Base64 Data URI' : isUrl ? 'HTTP URL' : 'Raw String'}, Length: ${firstImg.length} chars`);

    const result = await generateProductListingWithGemini({
      images,
      titleHint,
      categoryHint,
      notes,
    });

    console.log(`✅ [/api/admin/ai/product SERVER LOG] Gemini Analysis Complete -> Title: "${result.productTitle}" | Category: "${result.category}" | Subcategory: "${result.subcategory}"`);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('❌ [/api/admin/ai/product SERVER LOG EXCEPTION]:', error);
    return NextResponse.json(
      { success: false, error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
