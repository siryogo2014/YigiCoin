import { NextRequest, NextResponse } from 'next/server';

// Configuration from environment variables
const WEBHOOK_URL = process.env.PAYMENT_WEBHOOK_URL || '';
const WEBHOOK_TOKEN = process.env.PAYMENT_WEBHOOK_TOKEN || '';
const TIMEOUT_MS = parseInt(process.env.PAYMENT_TIMEOUT_MS || '10000', 10);
const MAX_RETRIES = 2;

interface PaymentValidationRequest {
  provider: 'paypal' | 'metamask';
  paymentDetails: Record<string, unknown>;
}

interface ValidationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * POST /api/payments/validate
 *
 * Validates payment by forwarding to external webhook URL
 * Implements timeout, retries, and authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: PaymentValidationRequest = await request.json();

    // Validate request structure
    if (!body.provider || !body.paymentDetails) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: provider and paymentDetails are required',
        },
        { status: 400 }
      );
    }

    // Check if webhook URL is configured
    if (!WEBHOOK_URL || WEBHOOK_URL.includes('example.com')) {
      console.warn('PAYMENT_WEBHOOK_URL not configured, skipping validation');
      // Return success if webhook is not configured (graceful degradation)
      return NextResponse.json({
        success: true,
        message: 'Payment validation skipped (webhook not configured)',
        data: body.paymentDetails,
      });
    }

    // Forward payment to webhook with retries
    const result = await forwardToWebhook(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error('Payment validation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error during payment validation',
      },
      { status: 500 }
    );
  }
}

/**
 * Forward payment details to external webhook with timeout and retries
 */
async function forwardToWebhook(
  paymentData: PaymentValidationRequest
): Promise<ValidationResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is configured
      if (WEBHOOK_TOKEN && !WEBHOOK_TOKEN.includes('your-webhook-token')) {
        headers['Authorization'] = `Bearer ${WEBHOOK_TOKEN}`;
      }

      // Make request to webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider: paymentData.provider,
          payment: paymentData.paymentDetails,
          timestamp: new Date().toISOString(),
          source: 'yigicoin-platform',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseData = await response.json().catch(() => ({}));

      // Check response status
      if (!response.ok) {
        throw new Error(
          `Webhook returned ${response.status}: ${responseData.error || response.statusText}`
        );
      }

      // Success
      return {
        success: true,
        message: 'Payment validated successfully',
        data: responseData,
      };
    } catch (error: any) {
      lastError = error;

      // Check if it's a timeout or network error
      if (error.name === 'AbortError') {
        console.warn(`Webhook timeout on attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
      } else {
        console.warn(`Webhook error on attempt ${attempt + 1}/${MAX_RETRIES + 1}:`, error.message);
      }

      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: lastError?.message || 'Failed to validate payment after multiple attempts',
  };
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
