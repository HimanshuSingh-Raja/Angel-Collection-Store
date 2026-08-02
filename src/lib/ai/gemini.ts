import { z } from 'zod';

/**
 * Enterprise Google Gemini Developer API Multimodal Service
 * Authenticated via x-goog-api-key header using process.env.GEMINI_API_KEY
 * NO OAuth2 / NO Bearer headers / NO Client-Side Exposure
 */

export interface GeminiProductAnalysisInput {
  images?: string[];
  titleHint?: string;
  categoryHint?: string;
  notes?: string;
}

export interface GeminiProductAnalysisResult {
  productTitle: string;
  shortSummary: string;
  detailedDescription: string;
  category: string;
  subcategory: string;
  color: string;
  material: string;
  pattern: string;
  occasion: string[];
  style: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  imageAltText: string;

  // Compatibility fields for form autofill
  title: string;
  description: string;
  shortDescription: string;
  productType: string;
  sku: string;
  slug: string;
  brand: string;
  fabric: string;
  printOrWork: string;
  fit: string;
  careInstructions: string;
  tags: string[];
  bulletFeatures: string[];
  specifications: Record<string, string>;
  confidence: number;
  detectedAttributes?: {
    category: string;
    subCategory: string;
    gender: string;
    fabric: string;
    work: string;
    pattern: string;
    occasion: string;
    fit: string;
    care: string;
    countryOfOrigin: string;
    hsnCode: string;
    gstRate: string;
  };
  suggestedPrices: {
    price: number;
    compareAtPrice: number;
    costPrice: number;
  };
}

export const GeminiResponseSchema = z.object({
  productTitle: z.string().optional().default(''),
  shortSummary: z.string().optional().default(''),
  detailedDescription: z.string().optional().default(''),
  category: z.string().optional().default('Other'),
  subcategory: z.string().optional().default('General'),
  color: z.string().optional().default(''),
  material: z.string().optional().default(''),
  pattern: z.string().optional().default(''),
  occasion: z.array(z.string()).optional().default([]),
  style: z.string().optional().default(''),
  seoTitle: z.string().optional().default(''),
  seoDescription: z.string().optional().default(''),
  seoKeywords: z.array(z.string()).optional().default([]),
  imageAltText: z.string().optional().default(''),

  // Form autofill fallback compatibility
  productType: z.string().optional().default('Uncategorized'),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  shortDescription: z.string().optional().default(''),
  slug: z.string().optional().default(''),
  sku: z.string().optional().default(''),
  brand: z.string().optional().default('Angel House Atelier'),
  fabric: z.string().optional().default(''),
  printOrWork: z.string().optional().default(''),
  fit: z.string().optional().default(''),
  careInstructions: z.string().optional().default('Dry Clean Only'),
  tags: z.array(z.string()).optional().default([]),
  bulletFeatures: z.array(z.string()).optional().default([]),
  specifications: z.record(z.string()).optional().default({}),
  confidence: z.number().optional().default(90),
  suggestedPrices: z
    .object({
      price: z.number().optional().default(14999),
      compareAtPrice: z.number().optional().default(19999),
      costPrice: z.number().optional().default(6500),
    })
    .optional()
    .default({ price: 14999, compareAtPrice: 19999, costPrice: 6500 }),
});

/**
 * Extracts raw Base64 data (without data URL prefix) and MIME type
 */
async function prepareImageParts(images: string[]): Promise<Array<{ inline_data: { mime_type: string; data: string } }>> {
  const parts: Array<{ inline_data: { mime_type: string; data: string } }> = [];

  for (const imgStr of images.slice(0, 3)) {
    if (!imgStr) continue;

    try {
      // 1. Data URI format (data:image/jpeg;base64,AAAA...)
      if (imgStr.startsWith('data:')) {
        const matches = imgStr.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const rawBase64WithoutPrefix = matches[2];
          console.log(`📸 [IMAGE LOG] Extracted MIME: ${mimeType} | Base64 Length: ${rawBase64WithoutPrefix.length} chars`);
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: rawBase64WithoutPrefix,
            },
          });
          continue;
        }
      }

      // 2. Remote HTTP/HTTPS URL
      if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
        console.log(`🌐 [IMAGE LOG] Fetching remote URL: ${imgStr.slice(0, 50)}...`);
        const res = await fetch(imgStr, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
          const rawBase64WithoutPrefix = buffer.toString('base64');
          console.log(`📸 [IMAGE LOG] Fetched Remote URL -> MIME: ${mimeType} | Size: ${buffer.length} bytes`);
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: rawBase64WithoutPrefix,
            },
          });
          continue;
        }
      }

      // 3. Raw Base64 string fallback
      if (imgStr.length > 100) {
        const rawBase64 = imgStr.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        console.log(`📸 [IMAGE LOG] Raw Base64 fallback -> MIME: image/jpeg | Length: ${rawBase64.length}`);
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: rawBase64,
          },
        });
      }
    } catch (err) {
      console.error('❌ [IMAGE PROCESSING ERROR]:', err);
    }
  }

  return parts;
}

export function normalizeGeminiResponse(rawResponse: any, input: GeminiProductAnalysisInput): GeminiProductAnalysisResult {
  const parsed = GeminiResponseSchema.parse(rawResponse || {});

  const prodType = parsed.productType && parsed.productType !== 'Uncategorized' ? parsed.productType : (parsed.category || 'Fashion Item');
  const title = parsed.productTitle || parsed.title || input.titleHint || `Luxury ${prodType}`;
  const category = parsed.category || 'Other';
  const subcategory = parsed.subcategory || prodType;
  const description = parsed.detailedDescription || parsed.description || `Exquisite ${prodType} from Angel Collection. Expertly crafted with luxury detailing.`;
  const shortDescription = parsed.shortSummary || parsed.shortDescription || `Luxury ${prodType} with refined craftsmanship.`;

  return {
    productTitle: title,
    shortSummary: shortDescription,
    detailedDescription: description,
    category: category,
    subcategory: subcategory,
    color: parsed.color || 'Multicolor',
    material: parsed.material || parsed.fabric || 'Premium Quality Material',
    pattern: parsed.pattern || parsed.printOrWork || 'Designer',
    occasion: Array.isArray(parsed.occasion) && parsed.occasion.length > 0 ? parsed.occasion : ['Festive', 'Wedding'],
    style: parsed.style || 'Luxury Atelier',
    seoTitle: parsed.seoTitle || `${title} | Angel Collection`,
    seoDescription: parsed.seoDescription || shortDescription.slice(0, 150),
    seoKeywords: parsed.seoKeywords && parsed.seoKeywords.length > 0 ? parsed.seoKeywords : [prodType.toLowerCase(), category.toLowerCase(), 'luxury fashion'],
    imageAltText: parsed.imageAltText || `${title} - Angel Collection`,

    // Compatibility fields for form populate
    title: title,
    description: description,
    shortDescription: shortDescription,
    productType: prodType,
    sku: parsed.sku || `AC-${prodType.slice(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    slug: parsed.slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
    brand: parsed.brand || 'Angel House Atelier',
    fabric: parsed.material || parsed.fabric || 'Premium Quality Material',
    printOrWork: parsed.pattern || parsed.printOrWork || 'Artisanal Work',
    fit: parsed.fit || 'Regular Fit',
    careInstructions: parsed.careInstructions || 'Dry Clean Only',
    tags: parsed.seoKeywords || parsed.tags || [prodType.toLowerCase(), category.toLowerCase()],
    bulletFeatures: parsed.bulletFeatures && parsed.bulletFeatures.length > 0 ? parsed.bulletFeatures : ['Premium Quality Material', 'Artisanal Craftsmanship'],
    specifications: parsed.specifications || {
      fabric: parsed.material || parsed.fabric || 'Premium Quality Material',
      pattern: parsed.pattern || 'Designer',
      occasion: (Array.isArray(parsed.occasion) ? parsed.occasion.join(', ') : parsed.occasion) || 'Festive',
      care: parsed.careInstructions || 'Dry Clean Only',
    },
    confidence: parsed.confidence || 90,
    detectedAttributes: {
      category: category,
      subCategory: subcategory,
      gender: 'Women',
      fabric: parsed.material || parsed.fabric || 'Premium Quality Material',
      work: parsed.pattern || parsed.printOrWork || 'Artisanal Work',
      pattern: parsed.pattern || 'Designer',
      occasion: (Array.isArray(parsed.occasion) ? parsed.occasion.join(', ') : parsed.occasion) || 'Festive',
      fit: parsed.fit || 'Regular Fit',
      care: parsed.careInstructions || 'Dry Clean Only',
      countryOfOrigin: 'India',
      hsnCode: '62040000',
      gstRate: '12%',
    },
    suggestedPrices: parsed.suggestedPrices || { price: 14999, compareAtPrice: 19999, costPrice: 6500 },
  };
}

export async function testGeminiTextSanity(apiKey: string, modelName: string): Promise<boolean> {
  try {
    console.log(`🤖 [SANITY TEST] Testing text-only prompt on model ${modelName} via x-goog-api-key...`);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Reply exactly: GEMINI_OK' }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`✅ [SANITY TEST SUCCESS] Response from ${modelName}: "${text.trim()}"`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`⚠️ [SANITY TEST FAILED] Model ${modelName} HTTP ${res.status}: ${errText.slice(0, 200)}`);
      return false;
    }
  } catch (err: any) {
    console.warn(`⚠️ [SANITY TEST EXCEPTION] Model ${modelName}:`, err?.message);
    return false;
  }
}

export async function generateProductListingWithGemini(
  input: GeminiProductAnalysisInput
): Promise<GeminiProductAnalysisResult> {
  // Read key SERVER-SIDE ONLY
  const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  console.log('GEMINI_API_KEY configured:', Boolean(apiKey));

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in process.env');
  }

  // Supported multimodal models under generativelanguage.googleapis.com
  const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastErrorMsg = '';

  // Step 10: Run Text Sanity Check First
  let validatedModel = '';
  for (const modelName of candidateModels) {
    const passedSanity = await testGeminiTextSanity(apiKey, modelName);
    if (passedSanity) {
      validatedModel = modelName;
      break;
    }
  }

  const activeModels = validatedModel ? [validatedModel, ...candidateModels.filter((m) => m !== validatedModel)] : candidateModels;

  // Step 11: Prepare Image Parts
  const imageParts = await prepareImageParts(input.images || []);
  console.log(`🖼️ [IMAGE LOG] Total image parts prepared: ${imageParts.length}`);

  // Step 12: Multimodal Product Prompt
  const prompt = `You are a Senior Merchandise Director and Product Classifier for "Angel Collection".

INSTRUCTIONS:
1. Visually inspect the attached product image.
2. Accurately determine what exact product is visible in the image (e.g. Lehenga, Kurti / Kurta Set, Salwar Suit, Anarkali, Gown, Saree, Western Dress, Co-ord Set, Top, Shirt, Jeans, Trousers, Skirt, Dupatta, Blouse, Fine Jewellery, Handbag, Footwear, etc.).
3. Do NOT classify a garment as "Saree" unless the image clearly shows a traditional 6-yard or 9-yard saree drape with pallu!
4. Output STRICT valid JSON matching this schema:
{
  "productTitle": "Compelling luxury product title",
  "shortSummary": "1-2 sentence summary of product",
  "detailedDescription": "Comprehensive description highlighting silhouette, craftsmanship, embellishments, and styling",
  "category": "Main category (e.g. Women, Men, Bags, Jewellery, Kids, Accessories)",
  "subcategory": "Specific subcategory (e.g. Bridal Lehengas, Designer Kurtis, Evening Gowns, Leather Totes)",
  "color": "Primary color visible in image",
  "material": "Detected fabric/material",
  "pattern": "Detected pattern/embroidery",
  "occasion": ["Wedding", "Festive"],
  "style": "Styling aesthetic",
  "seoTitle": "SEO title for product page",
  "seoDescription": "Meta description under 160 characters",
  "seoKeywords": ["keyword1", "keyword2"],
  "imageAltText": "Descriptive alt text for image"
}`;

  for (const modelName of activeModels) {
    try {
      console.log(`Gemini model: ${modelName}`);

      const requestParts: any[] = [...imageParts, { text: prompt }];

      // Official Gemini Developer API REST Request authenticated via x-goog-api-key header
      const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: requestParts,
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastErrorMsg = `HTTP ${response.status} ${response.statusText}: ${errText}`;
        console.error(`===== GEMINI MODEL CALL ERROR [${modelName}] =====`);
        console.error(`HTTP Status: ${response.status} ${response.statusText}`);
        console.error(`Error Body:`, errText.slice(0, 300));
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      console.log(`🔍 [GEMINI SERVER LOG] Raw Response snippet (${modelName}):`, rawText.slice(0, 200));

      let parsedJson: any = {};
      try {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error('===== GEMINI JSON PARSE ERROR =====');
        console.error(parseErr);
        throw new Error('Malformed JSON returned from Gemini.');
      }

      console.log(`✅ [GEMINI SERVER LOG] Visual analysis success! Product: "${parsedJson.productTitle || parsedJson.title}" | Category: "${parsedJson.category}"`);

      return normalizeGeminiResponse(parsedJson, input);
    } catch (modelError: any) {
      console.error(`===== GEMINI MODEL EXECUTION EXCEPTION [${modelName}] =====`);
      console.error(modelError);
    }
  }

  console.error('===== GEMINI PRODUCT ANALYSIS ERROR =====');
  console.error(new Error(`All candidate models failed. Last error: ${lastErrorMsg}`));
  throw new Error(`Gemini API execution failed.`);
}
