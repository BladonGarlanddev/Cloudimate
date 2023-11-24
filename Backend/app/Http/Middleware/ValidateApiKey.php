<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Key;
use Illuminate\Support\Facades\Log;

class ValidateApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function handle($request, Closure $next)
    {
        $apiKey = $request->header('Authorization');
        $email = $request->header('X-User-Email');
        if (!Key::isValid($apiKey, $email)) {
            Log::info("Key tried: " . Key::convertFormat($apiKey));
            return response()->json([
                'message'  => 'Invalid API key',
                'key tried'=> '(' . Key::convertFormat($apiKey) . ')'
            ], 401);
        }
        return $next($request);
    }
}
