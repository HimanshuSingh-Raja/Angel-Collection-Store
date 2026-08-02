import { z } from 'zod';

/**
 * Enterprise Google Gemini Developer API Multimodal Vision Service
 * Contextual Analysis combining Admin-Provided Product Title + Uploaded Product Image
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
  secondaryColors: string[];
  material: string;
  pattern: string;
  borderDesign?: string;
  neckline?: string;
  sleeveStyle?: string;
  occasion: string[];
  style: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  imageAltText: string;
  confidence: number;

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
  category: z.string().optional().default(''),
  subcategory: z.string().optional().default(''),
  color: z.string().optional().default(''),
  secondaryColors: z.array(z.string()).optional().default([]),
  material: z.string().optional().default(''),
  pattern: z.string().optional().default(''),
  borderDesign: z.string().optional().default(''),
  neckline: z.string().optional().default(''),
  sleeveStyle: z.string().optional().default(''),
  occasion: z.array(z.string()).optional().default([]),
  style: z.string().optional().default(''),
  seoTitle: z.string().optional().default(''),
  seoDescription: z.string().optional().default(''),
  seoKeywords: z.array(z.string()).optional().default([]),
  imageAltText: z.string().optional().default(''),
  confidence: z.number().optional().default(92),

  // Compatibility fields
  productType: z.string().optional().default(''),
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
          console.log(`📸 [MULTIMODAL PAYLOAD] Extracted MIME: ${mimeType} | Base64 Length: ${rawBase64WithoutPrefix.length} chars`);
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
        console.log(`🌐 [MULTIMODAL PAYLOAD] Fetching remote URL: ${imgStr.slice(0, 50)}...`);
        const res = await fetch(imgStr, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
          const rawBase64WithoutPrefix = buffer.toString('base64');
          console.log(`📸 [MULTIMODAL PAYLOAD] Fetched Remote URL -> MIME: ${mimeType} | Size: ${buffer.length} bytes`);
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
        console.log(`📸 [MULTIMODAL PAYLOAD] Raw Base64 fallback -> MIME: image/jpeg | Length: ${rawBase64.length}`);
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: rawBase64,
          },
        });
      }
    } catch (err) {
      console.error('❌ [MULTIMODAL IMAGE PROCESSING ERROR]:', err);
    }
  }

  return parts;
}

export function normalizeGeminiResponse(rawResponse: any, input: GeminiProductAnalysisInput): GeminiProductAnalysisResult {
  const parsed = GeminiResponseSchema.parse(rawResponse || {});

  const adminTitle = (input.titleHint || '').trim();
  const productTitle = adminTitle || parsed.productTitle || parsed.title || 'Luxury Product';
  const category = parsed.category || parsed.productType || 'Fashion Item';
  const subcategory = parsed.subcategory || category;
  const description = parsed.detailedDescription || parsed.description || '';
  const shortDescription = parsed.shortSummary || parsed.shortDescription || '';

  return {
    productTitle: productTitle,
    shortSummary: shortDescription,
    detailedDescription: description,
    category: category,
    subcategory: subcategory,
    color: parsed.color || '',
    secondaryColors: parsed.secondaryColors || [],
    material: parsed.material || parsed.fabric || '',
    pattern: parsed.pattern || parsed.printOrWork || '',
    borderDesign: parsed.borderDesign,
    neckline: parsed.neckline,
    sleeveStyle: parsed.sleeveStyle,
    occasion: Array.isArray(parsed.occasion) && parsed.occasion.length > 0 ? parsed.occasion : ['Festive', 'Wedding'],
    style: parsed.style || 'Luxury Atelier',
    seoTitle: parsed.seoTitle || `${productTitle} | Angel Collection`,
    seoDescription: parsed.seoDescription || shortDescription.slice(0, 150),
    seoKeywords: parsed.seoKeywords && parsed.seoKeywords.length > 0 ? parsed.seoKeywords : [category.toLowerCase(), 'luxury fashion'],
    imageAltText: parsed.imageAltText || `${productTitle} - Angel Collection`,
    confidence: parsed.confidence || 92,

    // Form autofill mappings
    title: productTitle,
    description: description,
    shortDescription: shortDescription,
    productType: category,
    sku: parsed.sku || `AC-${category.slice(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    slug: parsed.slug || productTitle.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
    brand: parsed.brand || 'Angel House Atelier',
    fabric: parsed.material || parsed.fabric || '',
    printOrWork: parsed.pattern || parsed.printOrWork || '',
    fit: parsed.fit || 'Regular Fit',
    careInstructions: parsed.careInstructions || 'Dry Clean Only',
    tags: parsed.seoKeywords || parsed.tags || [category.toLowerCase()],
    bulletFeatures: parsed.bulletFeatures && parsed.bulletFeatures.length > 0 ? parsed.bulletFeatures : [parsed.material || 'Luxury Quality', parsed.pattern || 'Artisanal Craftsmanship'],
    specifications: {
      fabric: parsed.material || parsed.fabric || '',
      pattern: parsed.pattern || parsed.printOrWork || '',
      occasion: (Array.isArray(parsed.occasion) ? parsed.occasion.join(', ') : parsed.occasion) || 'Festive',
      fit: parsed.fit || 'Regular Fit',
      care: parsed.careInstructions || 'Dry Clean Only',
    },
    detectedAttributes: {
      category: category,
      subCategory: subcategory,
      gender: 'Women',
      fabric: parsed.material || parsed.fabric || '',
      work: parsed.pattern || parsed.printOrWork || '',
      pattern: parsed.pattern || '',
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

export async function generateProductListingWithGemini(
  input: GeminiProductAnalysisInput
): Promise<GeminiProductAnalysisResult> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  console.log('GEMINI_API_KEY configured:', Boolean(apiKey));

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in process.env');
  }

  // 1. Prepare Image Parts
  const imageParts = await prepareImageParts(input.images || []);
  console.log(`🖼️ [MULTIMODAL LOG] Total image parts prepared: ${imageParts.length}`);

  if (imageParts.length === 0) {
    throw new Error('No valid product image provided.');
  }

  const adminTitle = (input.titleHint || '').trim();
  if (!adminTitle) {
    throw new Error('No product title provided.');
  }

  console.log(`📝 [MULTIMODAL CONTEXT LOG] Admin Title Context: "${adminTitle}"`);

  // 2. Combined Admin Title Context + Image Analysis Prompt
  const prompt = `You are an expert fashion e-commerce product catalog analyst for "Angel Collection".

The store administrator has provided a product title and product image.

ADMIN PROVIDED PRODUCT TITLE:
"${adminTitle}"

Treat the title as contextual information about what the product is.

Now carefully inspect the supplied product image.

Combine:
1. Information explicitly provided in the title
2. Details actually visible in the image

Generate accurate e-commerce catalog information.

Do NOT contradict the admin-provided title unless there is an obvious mismatch.
Do NOT replace or rewrite the original Product Title. Keep the productTitle as "${adminTitle}".

Use visual evidence for primary/secondary colors, embroidery/work, patterns, border design, neckline, sleeves, and visible design details.

Do not invent details that cannot reasonably be determined from the image.
Especially do not confidently guess exact fabric composition only from appearance.

If the title says 'Banarasi Silk Saree', you may use Banarasi Silk because the admin explicitly provided that information.
But if the title only says 'Designer Saree', do not invent 'Silk' unless there is reliable evidence in the image.

Avoid generic outputs such as:
Other
Luxury Other
Premium Quality Material
Artisanal Work

Generate information specifically for this product.

Output ONLY a single valid JSON object matching this schema:
{
  "productTitle": "${adminTitle}",
  "shortSummary": "1-2 sentence compelling summary based on title and visual image analysis",
  "detailedDescription": "Comprehensive product description covering silhouette, craftsmanship, embellishments, and styling",
  "category": "Main category e.g. Sarees, Lehengas, Kurtis, Gowns, Suits, Western Wear, Jewellery, Handbags, Shoes, etc.",
  "subcategory": "Specific subcategory e.g. Banarasi Sarees, Bridal Lehengas, Designer Kurtis, Evening Gowns, Leather Totes",
  "color": "Primary color visibly identified in image",
  "secondaryColors": ["Secondary color 1", "Secondary color 2"],
  "material": "Detected fabric/material",
  "pattern": "Detected pattern, embroidery, work, or motifs",
  "borderDesign": "Border detailing if visible",
  "neckline": "Neckline style if visible",
  "sleeveStyle": "Sleeve style if visible",
  "occasion": ["Wedding", "Festive", "Evening Gala"],
  "style": "Design aesthetic",
  "seoTitle": "${adminTitle} | Angel Collection",
  "seoDescription": "Meta description under 160 characters",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "imageAltText": "${adminTitle} - Angel Collection",
  "confidence": 92
}`;

  const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastErrorMsg = '';

  for (const modelName of candidateModels) {
    try {
      console.log(`Gemini model: ${modelName}`);

      const requestParts: any[] = [...imageParts, { text: prompt }];

      const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

      console.log(`✅ [GEMINI SERVER LOG] Multimodal analysis success! Title: "${parsedJson.productTitle || adminTitle}" | Category: "${parsedJson.category}"`);

      return normalizeGeminiResponse(parsedJson, input);
    } catch (modelError: any) {
      console.error(`===== GEMINI MODEL EXECUTION EXCEPTION [${modelName}] =====`);
      console.error(modelError);
    }
  }

  console.error('===== GEMINI PRODUCT ANALYSIS ERROR =====');
  console.error(new Error(`All candidate models failed. Last error: ${lastErrorMsg}`));
  throw new Error('AI analysis failed. Please try again.');
}
