<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
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

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // quickbooks configurations for different environments
    'quickbooks_test1' => [
        'client_id' => env('QB_TEST1_CLIENT_ID'),
        'client_secret' => env('QB_TEST1_CLIENT_SECRET'),
        'redirect_uri' => env('QB_TEST1_REDIRECT_URI'),
        'environment' => env('QB_TEST1_ENVIRONMENT', 'production'),
        'api_base' => env('QB_TEST1_API_BASE'),
    ],
    // 1971 order details
    'main_store' => [
        'url'   => env('MAIN_STORE_API_URL'),
        'token' => env('MAIN_STORE_API_TOKEN'),
        'api_key' => env('MAIN_STORE_API_KEY'),
        'stripe_secret' => env('MAIN_STORE_STRIPE_SECRET'),
    ],

    // Standalone 1971co store (separate app/database from viveren)
    'store_1971co' => [
        'url'   => env('STORE_1971CO_API_URL'),
        'token' => env('STORE_1971CO_API_TOKEN'),
        'api_key' => env('STORE_1971CO_API_KEY'),
        'stripe_secret' => env('STORE_1971CO_STRIPE_SECRET'),
    ],

    // Amazon Selling Partner API (Orders v0) - LWA-only auth (no AWS SigV4 required since 2021)
    'amazon_sp_api' => [
        'client_id' => env('AMAZON_SP_CLIENT_ID'),
        'client_secret' => env('AMAZON_SP_CLIENT_SECRET'),
        'refresh_token' => env('AMAZON_SP_REFRESH_TOKEN'),
        // one of: na (North America), eu (Europe), fe (Far East)
        'region' => env('AMAZON_SP_REGION', 'na'),
        // comma-separated marketplace ids, e.g. ATVPDKIKX0DER for Amazon.com
        'marketplace_ids' => env('AMAZON_SP_MARKETPLACE_IDS', 'ATVPDKIKX0DER'),
        'seller_id' => env('AMAZON_SP_SELLER_ID'),
    ],

    'veeqo' => [
        'key' => env('VEEQO_API_KEY'),
        'url' => env('VEEQO_API_URL', 'https://api.veeqo.com'),
        'dashboard_url' => env('VEEQO_DASHBOARD_URL', 'https://app.veeqo.com'),
        'verify_ssl' => env('VEEQO_VERIFY_SSL', true),
        'ca_bundle' => env('VEEQO_CA_BUNDLE'),
        'origin' => [
            'address1' => env('VEEQO_ORIGIN_ADDRESS1'),
            'city' => env('VEEQO_ORIGIN_CITY'),
            'state' => env('VEEQO_ORIGIN_STATE'),
            'zip' => env('VEEQO_ORIGIN_ZIP'),
            'country' => env('VEEQO_ORIGIN_COUNTRY'),
        ],
    ],


];
