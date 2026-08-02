import { NextResponse } from 'next/server';
import { generateProductListingWithGemini } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { images, titleHint, categoryHint, notes } = body;

    console.log('🤖 [/api/admin/ai/product] Processing Gemini Multimodal AI Request...');
    console.log('🖼️ [/api/admin/ai/product] Images received count:', Array.isArray(images) ? images.length : 0);

    if (!images || !Array.isArray(images) || images.length === 0 || !images[0]) {
      return NextResponse.json(
        { success: false, error: 'Please upload at least one product image before generating AI analysis.' },
        { status: 400 }
      );
    }

    const firstImg = images[0];
    const isDataUri = firstImg.startsWith('data:');
    const isUrl = firstImg.startsWith('http');
    console.log(`🔍 [/api/admin/ai/product SERVER LOG] Image 1 Format: ${isDataUri ? 'Base64 Data URI' : isUrl ? 'HTTP URL' : 'Raw String'}, Payload Length: ${firstImg.length} chars`);

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
