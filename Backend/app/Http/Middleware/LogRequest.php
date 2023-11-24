<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogRequest
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('API Request', [
            'url'       => $request->fullUrl(),
            'method'    => $request->method(),
            'ip'        => $request->ip(),
            'agent'     => $request->header('User-Agent'),
            'params'    => $request->all(),
        ]);

        return $next($request);
    }
}
