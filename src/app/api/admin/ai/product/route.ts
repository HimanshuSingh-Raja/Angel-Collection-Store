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
      console.error('===== GEMINI PRODUCT ANALYSIS ERROR =====');
      console.error('Failed to parse request JSON body:', parseError);
      return NextResponse.json(
        { success: false, error: 'AI analysis failed. Please try again.' },
        { status: 400 }
      );
    }

    const { images, titleHint, categoryHint, notes } = body || {};

    console.log('GEMINI_API_KEY configured:', Boolean(process.env.GEMINI_API_KEY));
    console.log('🤖 [/api/admin/ai/product] Request received. Image count:', Array.isArray(images) ? images.length : 0);

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

    console.log(`✅ [/api/admin/ai/product] Success -> Title: "${result.productTitle}" | Category: "${result.category}"`);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('===== GEMINI PRODUCT ANALYSIS ERROR =====');
    console.error(error);
    console.error('Error Name:', error?.name);
    console.error('Error Message:', error?.message);
    console.error('Error Status:', error?.status);
    console.error('Error StatusText:', error?.statusText);
    console.error('Error Cause:', error?.cause);

    return NextResponse.json(
      { success: false, error: 'AI analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
