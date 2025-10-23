<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class GuestMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::user();

                if ($user->role === 'admin') {
                    return redirect()->route('dashboard');
                }

                if ($user->role === 'client') {
                    return redirect()->route('client.dashboard');
                }

                if ($user->role === 'commercial') {
                    return redirect()->route('commercial.dashboard');
                }
            }
        }

        return $next($request);
    }

}
