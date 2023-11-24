<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Session;
use Tymon\JWTAuth\Facades\JWTAuth; // Import JWTAuth facade
use Illuminate\Support\Facades\Log; // Import Log facade

class JWTMiddleware 
{
    public function handle($request, Closure $next)
    {
        $jwtToken = Session::get('jwt_token');

        if (!$jwtToken || !JWTAuth::setToken($jwtToken)->check()) {
            // User is not authenticated
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}