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
    } catch (parseError: any) {
      console.error('❌ [/api/admin/ai/product] GEMINI REAL ERROR - Request Body Parse Failed:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Image payload may be too large.' },
        { status: 400 }
      );
    }

    const { images, titleHint, categoryHint, notes } = body || {};

    console.log('🤖 [/api/admin/ai/product] Processing Gemini Multimodal AI Request...');
    console.log('🖼️ [/api/admin/ai/product] Images received count:', Array.isArray(images) ? images.length : 0);

    if (!images || !Array.isArray(images) || images.length === 0 || !images[0]) {
      return NextResponse.json(
        { success: false, error: 'Please upload at least one product image before generating AI analysis.' },
        { status: 400 }
      );
    }

    const firstImg = String(images[0]);
    const isDataUri = firstImg.startsWith('data:');
    const isUrl = firstImg.startsWith('http');
    console.log(`🔍 [/api/admin/ai/product] Image 1 Format: ${isDataUri ? 'Base64 Data URI' : isUrl ? 'HTTP URL' : 'Raw String'}, Length: ${firstImg.length} chars`);

    const result = await generateProductListingWithGemini({
      images,
      titleHint,
      categoryHint,
      notes,
    });

    console.log(`✅ [/api/admin/ai/product] Gemini Analysis Complete -> Title: "${result.productTitle}" | Category: "${result.category}" | Subcategory: "${result.subcategory}"`);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('GEMINI REAL ERROR:', error);
    console.error('GEMINI ERROR DETAILS:', {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      cause: error?.cause,
      stack: error?.stack ? error.stack.slice(0, 400) : undefined,
    });

    return NextResponse.json(
      { success: false, error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
