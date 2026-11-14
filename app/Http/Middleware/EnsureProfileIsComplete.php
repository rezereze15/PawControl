<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Server-side guard for the "complete your profile" modal: while a Google user's
 * profile is incomplete, every protected action is refused. Hiding the modal in
 * the browser therefore unlocks nothing.
 */
class EnsureProfileIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->hasCompleteProfile()) {
            return $next($request);
        }

        $message = 'Please complete your profile to continue.';

        // Plain API/fetch calls get a 403; Inertia/page visits go back to the dashboard (and its modal).
        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['message' => $message], 403);
        }

        return redirect()->route('dashboard')->withErrors(['profile' => $message]);
    }
}
