<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Subscription;
use Stripe\PaymentIntent;
use Stripe\Coupon as StripeCoupon;
use Illuminate\Support\Facades\Log;
use App\Models\Key;
use App\Models\User;

class StripeHandler extends Controller
{

    public function __construct(Request $request) {
        $email = $request->header('X-User-Email');
        $this->currentUser = User::where('email', $email)->first();
    }

    public function isStripeCouponValid(Request $request) {
        Stripe::setApiKey(config('services.stripe.sk'));

        $couponCode = $request->get('coupon_code'); // assuming the coupon code is sent with the key 'coupon_code'
        $couponID = null;

        if (!$couponCode) {
            return response()->json(['error' => 'Coupon code not provided'], 400);
        }

        if(!($couponID = $this->getCouponId($couponCode))) {
            return response()->json(['error' => 'invalid coupon'], 403);
        } 

        if ($couponID === 'free') {
            return response()->json(['coupon' => 'free'], 200);
        } 

        try {
        // Attempt to retrieve the coupon from Stripe
            $coupon = StripeCoupon::retrieve($couponID);

        // Check if the coupon is valid based on its parameters (e.g., not expired)
            if ($coupon->valid) {
                return response()->json(['message' => 'Valid coupon code'], 200);
            } else {
                return response()->json(['error' => 'Invalid or expired coupon code'], 400);
            }

        } catch (\Stripe\Exception\InvalidRequestException $e) {
        // Handle when the coupon code does not exist in Stripe
            return response()->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
        // Handle any other errors
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function handleWebhook(Request $request)
    {
        $stripeWebhookSecret = config('services.stripe.webhook');
        $payload = json_decode($request->getContent(), true);

        // Verify the Stripe signature for security (optional but recommended)
        // See Stripe documentation for signature verification.

        // Handle the specific event
        switch ($payload['type']) {
            case 'customer.subscription.deleted':
                $this->handleSubscriptionCancelled($payload['data']['object']);
                break;
            case 'subscription_schedule.canceled':
                $this->handleSubscriptionCancelled($payload['data']['object']);
                break;
            // Handle other events as needed
        }
        return response()->json(['status' => 'Webhook received']);
    }

    private function handleSubscriptionCancelled($subscription)
    {
        $user = User::where('subscription_id', $subscription)->first();
        $apiKey = Key::where('user_id', $user->id)->first();
        Log::info($apiKey);
        $apiKey->valid = false;
        $apiKey->save();
    }

    public function createStripeUser(Request $request) {
    try {
        
        // Set your Stripe API key
        Stripe::setApiKey(config('services.stripe.sk'));
        $requestData = $request->json()->all();
        $couponCode = $requestData['coupon_code'];
        try {
            $paymentMethodId = $requestData['id'];
            $subscriptionType = $requestData['subscription_type'];
        } catch (\Exception $e) {
            Log::info("coupon code: " . $couponCode);
            if ($couponCode === 'fH7z1XvD3uB8mO6pE9sV2rQ4tI5yG0xWjZl6kYhT7cU8bF9nL3aA0oM5wR2gS4dP') {
                $this->validateApiKey();
                return response()->json([
                    'user'    => [
                        "api_key" => $this->currentUser->apiKey->api_key,
                        "name"    => $this->currentUser->name,
                        "email"   => $this->currentUser->email
                    ]
                ], 200); 
            }
        }
        

        Log::info("Subscription Type: " . $subscriptionType);
        // Create a new customer in Stripe without a payment method
        $customer = Customer::create([
            'name' => $this->currentUser->name,
            'email' => $this->currentUser->email,
            'payment_method' => $paymentMethodId,
            'invoice_settings' => [
                'default_payment_method' => $paymentMethodId,
            ],
        ]);
        $this->currentUser->stripe_id = $customer->id;
        $this->currentUser->subscription_id = $this->createSubscription($customer->id, $subscriptionType, $couponCode)->id;
        $this->currentUser->save();
        return response()->json(['stripe_id' => $customer->id]);
    } catch (\Exception $e) {
        Log::error('Error creating Stripe customer: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createSubscription($customerId, $subscriptionType, $couponCode)
    {   
        Log::info("Subscription creation script ran");
        Stripe::setApiKey(config('services.stripe.sk'));

        $subscriptionPlanId = 'price_1O21HNAfl1llovkS9BCEDs5H'; // Replace with your plan ID
        $freeTrialDays = ($subscriptionType == 'free-trial') ? 14 : 0;

        $subscriptionData = [
            'customer' => $customerId,
            'items' => [
                ['price' => $subscriptionPlanId],
            ],
            'trial_period_days' => $freeTrialDays
        ];

        if ($couponID = $this->getCouponId($couponCode)) {
            $subscriptionData['coupon'] = $couponID;
        }
        Log::info("Made it past coupon checks ");
        try {
            $subscription = Subscription::create($subscriptionData);
            if ($subscription) {
                $this->validateApiKey();
            }
            Log::info("Subscription created");
            Log::info("Subscription: " . $subscription);
            return $subscription;
        } catch (\Exception $e) {
            Log::error('Error creating Stripe subscription: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create Stripe subscription'], 500);
        }
    }

    protected function validateApiKey()
    {
            $this->currentUser->apiKey->valid = true;
            $this->currentUser->apiKey->save();
    }

    protected function getCouponId($couponCode)
    {
        if ($couponCode === 'WELCOMETOCLOUDIMATE') {
            return '89XDnCpC';
        }
        if ($couponCode === 'fH7z1XvD3uB8mO6pE9sV2rQ4tI5yG0xWjZl6kYhT7cU8bF9nL3aA0oM5wR2gS4dP') {
            return 'free';
        }
        
        return null;
    }



    public function deleteSubscription(Request $request)
    {
    try {
        $email = $request->email;
        $userData = User::where('email', $email)->first();
        $subscriptionId = $userData->subscription_id;
     
        Stripe::setApiKey(config('services.stripe.sk'));

        $subscription = Subscription::retrieve($subscriptionId);

        // Delete the subscription
        $subscription->delete();

        return response()->json(['success' => 'Stripe subscription deleted successfully'], 200);
    } catch (\Exception $e) {
        Log::error('Error deleting Stripe subscription: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to delete Stripe subscription'], 500);
    }
    }

    public function createIntent(Request $request) {
        Stripe::setApiKey(config('services.stripe.sk'));
        $intent = PaymentIntent::create([
            'amount' => 1500, // Amount in cents
            'currency' => 'usd', // Change to your currency
            'automatic_payment_methods' => ['enabled' => true]
        ]);
        return response()->json(['clientSecret' => $intent->client_secret]);
    }
    
    public function confirmIntent(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.sk'));
        try {
            // Retrieve the Payment Intent ID from the request
            $paymentIntentId = $request->input('paymentIntentID');
            // Retrieve the Payment Intent from Stripe
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            // Check the status of the Payment Intent
            if ($paymentIntent->status === 'succeeded') {
                return response()->json(['message' => 'Payment confirmed']);
            } else {
                // Payment failed or has not been confirmed, handle accordingly
                return response()->json(['message' => 'Payment not confirmed'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSubscriptionData(Request $request) {
        $user = User::where('email', $request->email)->first();

    // Handle the case where the user is not found
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }   

        if (!$user->stripe_id) {
            if($user->apiKey->valid == true) {
                return response()->json(['end_date' => 'Never expires', 'subscription_type' => 'Free']);
            }
            return response()->json(['end_date' => 'N/A', 'subscription_type' => 'No Subscription']);
        }

        Stripe::setApiKey(config('services.stripe.sk'));

        try {
            $subscription = \Stripe\Subscription::retrieve($user->subscription_id);

            $end_date = date('Y-m-d', $subscription->current_period_end);

            if ($subscription->trial_end && $subscription->trial_end > time()) {
                $subscription_type = 'free-trial';
            } else {
                $subscription_type = 'paid';
            }

            return response()->json(['end_date' => $end_date, 'subscription_type' => $subscription_type]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json(['error' => 'Stripe API error: ' . $e->getMessage()], 500);
        }
    }

}
