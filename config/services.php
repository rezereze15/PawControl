<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'supabase' => [
        'url' => env('SUPABASE_URL'),
        // Server-side secret (service role) key. Never expose this to the browser.
        'secret_key' => env('SUPABASE_SECRET_KEY'),
        'payment_proofs_bucket' => env('SUPABASE_PAYMENT_PROOFS_BUCKET', 'payment-proofs'),
        'profile_photos_bucket' => env('SUPABASE_PROFILE_PHOTOS_BUCKET', 'profile-photos'),
        'pet_photos_bucket' => env('SUPABASE_PET_PHOTOS_BUCKET', 'pet-profiles'),
        'ca_bundle' => env('SUPABASE_CA_BUNDLE'),
    ],

    // "Sign in with Google" (Laravel Socialite). Values live in .env only.
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', rtrim((string) env('APP_URL', 'http://localhost:8000'), '/').'/auth/google/callback'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
