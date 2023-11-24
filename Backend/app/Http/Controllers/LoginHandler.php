<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class LoginHandler extends Controller
{
    function validateUser(Request $request) {
        $accessToken = str_replace('Bearer ', '', $request->header('Authorization'));
        $googleClientId = '1076890227114-qbum0808977bhupjefog687f00c1mr9n.apps.
        googleusercontent.com'; //env('GOOGLE_CLIENT_ID'); // Replace with your actual Google Client ID
        // Verify the id_token with Google
        $response = Http::get('https://www.googleapis.com/oauth2/v3/tokeninfo', [
            'access_token' => $accessToken
        ]);

        $data = $response->json();
        Log::notice('Google response', [
            'data' => $data,
        ]);
        try {
            if (strpos($data['email'], 'ecoesc.org') !== false) {
                // Valid id_token, process the user data as needed
                return response()->json($data);
            } else {
                // Invalid id_token
                Log::notice('Google response', [
                    'request' => 'invalid',
                ]);
                return response()->json(['message' => 'Invalid id_token'], 401);
            }
        } catch (\Exception $e) {
            // Handle any exceptions that might occur during processing
            Log::error('An error occurred: ' . $e->getMessage());
            return response()->json(['message' => 'An error occurred'], 500);
        }
        
    }
}
