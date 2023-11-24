<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stripe\Webhook;

class VerifyStripeWebhookSignature
{
    public function handle(Request $request, Closure $next)
    {
        // Get the signing secret key from your Stripe Dashboard
        $stripeSigningSecret = config('services.stripe.tsk'); // Retrieve it from your config file

        // Retrieve the Stripe signature header from the request
        $stripeSignature = $request->header('Stripe-Signature');

        try {
            // Verify the signature
            $event = Webhook::constructEvent(
                $request->getContent(),
                $stripeSignature,
                $stripeSigningSecret
            );

            // Attach the verified event to the request for later use
            $request->attributes->add(['stripe_event' => $event]);

            return $next($request);
        } catch (\Exception $e) {
            // Signature verification failed, handle accordingly
            return response()->json(['error' => 'Invalid Stripe webhook signature'], 400);
        }
    }
}
