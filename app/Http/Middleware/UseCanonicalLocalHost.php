<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Local only: browsers keep separate cookies for 127.0.0.1 and localhost, so logging in on
 * one and being redirected to the other (Google always returns to APP_URL) looks like being
 * logged out. Send every 127.0.0.1 page visit to APP_URL's host so there is one session.
 */
class UseCanonicalLocalHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $appUrl = rtrim((string) config('app.url'), '/');
        $appHost = parse_url($appUrl, PHP_URL_HOST);

        if (app()->isLocal()
            && $request->isMethod('GET')
            && $request->getHost() === '127.0.0.1'
            && $appHost !== null
            && $appHost !== '127.0.0.1') {
            return redirect()->away($appUrl.$request->getRequestUri());
        }

        return $next($request);
    }
}
