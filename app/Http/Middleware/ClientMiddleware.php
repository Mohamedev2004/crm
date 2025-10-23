<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->role === 'client') {
            return $next($request);
        }

        // Redirect unauthorized users back or to home
        return redirect()->back()->with('error', 'Access denied'); 
        // Or if you want a fixed route:
        // return redirect()->route('home')->with('error', 'Access denied');
    }
}
