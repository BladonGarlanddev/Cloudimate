<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\User;
use App\Models\Key;
use App\Models\Aws;
use App\Models\Token;
use App\Models\Mfa;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Aws\Ses\SesClient;
use GuzzleHttp\Client;
use Aws\Credentials\InstanceProfileProvider;
use PragmaRX\Google2FALaravel\Google2FA;
use Google_Client;
use Laravel\Socialite\Facades\Socialite;
use Google\Auth\AccessToken;
// \Log::channel('critical')->critical('Unexpected error occurred: ' . $exception->getMessage());


class UserHandler extends Controller
{
    protected $currentUser;

    public function __construct(Request $request) {
        $email = $request->header('X-User-Email');
        $this->currentUser = User::where('email', $email)->first();
    }

    function create(Request $request) {
        try {
            $jsonData = $request->json()->all();
            $user = User::where('email' , $jsonData['email'])->first();

            if(Str::contains($jsonData['password'], ' ')) {
                return response()->json(['error' => 'Password cannot contain spaces.'], Response::HTTP_CONFLICT);
            }

            if($user) {
                return response()->json(['error' => 'Email taken. Use a different email.'], Response::HTTP_CONFLICT);
            }
            
            $user = new User([
                'name' => $jsonData['name'],
                'email' => $jsonData['email'],
                'password' => $jsonData['password'],
                'street_address' => $jsonData['street_address'],
                'city' => $jsonData['city'],
                'zip' => $jsonData['zip'],
                'state' => $jsonData['state']
            ]);
            $user->save(); 
            $apiKey = new Key(['api_key' => Str::random(32)]); // Generate an API key
            $user->apiKey()->save($apiKey);
            $mfa = new Mfa(); // Generate an API key
            $user->mfa()->save($mfa);
            $aws = new Aws(['external_id' => Str::random(20)]); // Generate an API key
            $user->awsCredentials()->save($aws);
            Log::info('3');
            return response()->json([
                'created' => 'successfully created.',
                'user'    => [
                    "api_key" => $apiKey->api_key,
                    "name"    => $user->name,
                    "email"   => $user->email
                    ]
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            Log::info($e);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    function login(Request $request) {
        try {
            $jsonData = $request->json()->all();
            $code = $request->mfa_code;
            Log::info("code: " . $code);
            if($this->currentUser->is_google_user && !$this->currentUser->password) {
                return response()->json(['error' => 'You cannot login with a google account using the login form. This is suspicious activity and has been flagged. Also, you are an idiot.'], Response::HTTP_UNAUTHORIZED);
            }
            if(password_verify(str_replace(' ', '', $jsonData['password']), $this->currentUser->password)) {
                if($this->currentUser->mfa->mfa_enabled) {
                    if(!$this->authenticateMFA($code)) {
                        return response()->json(['error' => 'Invalid Credentials'], Response::HTTP_UNAUTHORIZED);
                    }
                }
                return response()->json([
                'user'    => [
                    "api_key" => $this->currentUser->apiKey->api_key,
                    "name"    => $this->currentUser->name,
                    "email"   => $this->currentUser->email
                    ]
            ], 200);
            } else {
                return response()->json(['error' => 'Invalid Credentials'], Response::HTTP_UNAUTHORIZED);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    function updateAwsCredentials(Request $request) {
        try {
            $jsonData = $request->json()->all();

            if($this->currentUser) {
                $awsCredentials = $this->currentUser->awsCredentials;
                if($awsCredentials === null) {
                    $awsCredentials = new Aws();
                    $this->currentUser->awsCredentials()->save($awsCredentials);
                }

    // Update the AWS credentials
                $awsCredentials->setAwsCredentials(
                    $request->input('arn')
                );
                $awsCredentials->save();
                return response()->json(['message' => 'AWS credentials updated successfully']);            
            }
        } catch (\Exception $e) {
            return response()->json(['error' => utf8_encode($e->getMessage())], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    function getResetToken() {        
        try {
            if (!$this->currentUser) {
                return response()->json(['message' => 'User not found'], 404);
            }
            if($this->currentUser->token) {
                if($this->currentUser->token->created_at->diffInMinutes(now()) < 5) {
                    return response()->json(['error' => "Too short between code requests"], Response::HTTP_INTERNAL_SERVER_ERROR);
                }
                $this->currentUser->token()->delete();
            }
            Log::info("1");
            $token = new Token(['token' => Str::random(9)]);
            $this->currentUser->token()->save($token);
            Log::info("2");
            $ses = new SesClient([
            'version' => 'latest',
            'region' => 'us-east-2' // Replace with your AWS region
            ]);
            Log::info("3");
            $ses->sendEmail([
                'Source' => env('MAIL_FROM_ADDRESS'), // Your SES verified email
                'Destination' => [
                    'ToAddresses' => [$this->currentUser->email], // Recipient's email address
                ],
                'Message' => [
                    'Subject' => [
                        'Data' => 'Password Reset Token',
                    ],
                    'Body' => [
                        'Text' => [
                            'Data' => 'Your token is: ' . $token->token,
                        ],
                    ],
                ],
            ]);
            Log::info("4");
            return response()->json(['success' => 'Code sent']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
    }

    function changePassword(Request $request) {
        try {
            $jsonData = $request->json()->all();
            $enteredToken = $jsonData['token'];
            $enteredPassword = $jsonData['password'];
            $newPassword = $jsonData['new_password'];
            
            if(!password_verify(str_replace(' ', '', $enteredPassword), $this->currentUser->password)) {
                return response()->json(['message' => 'Internal Server Error'], 500);
            }

            if(Str::contains($enteredPassword, ' ')) {
                return response()->json(['error' => 'Password cannot contain spaces.'], Response::HTTP_CONFLICT);
            }
            if (!$user) {
                return response()->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
        
            $token = Token::where('token', $enteredToken)->first();

            if (!$token) {
                return response()->json(['error' => 'Token not found'], Response::HTTP_NOT_FOUND);
            }

            if ($token->created_at->addMinutes(10)->lt(now())) {
                $token->delete();
                return response()->json(['error' => 'Token has expired'], Response::HTTP_UNAUTHORIZED);
            }

            if ($token->token === $enteredToken) {
                $this->currentUser->password = $newPassword;
                $this->currentUser->save();
                $token->delete(); 
                return response()->json(['message' => 'Password changed successfully'], Response::HTTP_OK);
            } else {
                return response()->json(['error' => 'Invalid token'], Response::HTTP_UNAUTHORIZED);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    function rotateApiKey(Request $request) {
        try {
            $jsonData = $request->json()->all();
            
            if (!$this->currentUser) {
                return response()->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $apiKeyModel = $this->currentUser->apiKey;

            if (!$apiKeyModel) {
                return response()->json(['error' => 'API Key not found'], Response::HTTP_NOT_FOUND);
            }

            $newApiKey = Str::random(32);

        // Update the API key in the database
            $apiKeyModel->api_key = $newApiKey;
            $apiKeyModel->save();
            return response()->json(['api_key' => $newApiKey],  Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function enableMFA(Request $request)
    {
        $google2fa = app('pragmarx.google2fa');
        $secret = $google2fa->generateSecretKey();

        $mfa = $this->currentUser->mfa;
        if ($mfa === null) {
        // If not, create one
            $mfa = new Mfa();
            $this->currentUser->mfa()->save($mfa);
        }   
        // Temporary store the secret in the session
        $mfa->mfa_secret = $secret;
        $mfa->is_pending = 1;
        $mfa->save();

        // Generate a QR code URL for the user to scan
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $this->currentUser->email,
            $secret
        );

        return response()->json(['qrCodeUrl' => $qrCodeUrl]);
    }

    public function verifyInitialMFA(Request $request)
    {
        try {
            $secret = $this->currentUser->mfa->mfa_secret;

            $google2fa = app('pragmarx.google2fa');

            $valid = $google2fa->verifyKey($secret, $request->input('otp'));

            if ($valid) {
        // Save the secret to the user's MFA record and mark as enabled
                
                $this->currentUser->mfa->mfa_enabled = true;
                $this->currentUser->mfa->is_pending = 0;
                $this->currentUser->mfa->is_set = 1;
                $this->currentUser->mfa->save();

        // Clear the temporary session
                $request->session()->forget('mfa_secret');

                return response()->json(['success' => true, 'message' => 'MFA enabled successfully!']);
            } else {
                return response()->json(['success' => false, 'message' => 'Invalid OTP provided.'], 400);
            }
        } catch (\Exception $e) {
            Log::error($e);
        }
        
    }

    public function toggleMFA(Request $request)
    {
        $mfa = $this->currentUser->mfa;
        if($mfa->is_set == 0) {
            return response()->json(['success' => false, 'message' => 'MFA has not been set. Must be set to be enabled or disabled'], 400); 
        }

        if($mfa->mfa_enabled == 1) {
            $secret = $this->currentUser->mfa->mfa_secret;
            $google2fa = app('pragmarx.google2fa');
            $valid = $google2fa->verifyKey($secret, $request->input('otp'));
            if(!$valid) {
                return response()->json(['success' => false, 'message' => 'MFA has not been set. Must be set to be enabled or disabled'], 400); 
            }
            $mfa->mfa_enabled = 0;
        } else {
            $mfa->mfa_enabled = 1;
        }
        $mfa->save();
        return response()->json(['success' => true, 'message' => 'MFA state changed successfully!']);

    }

    public function generateBackupCodes(Request $request)
    {
        //
    }

    public function authenticateMFA($MFAcode)
    {   try {
            $google2fa = app('pragmarx.google2fa');
            $valid = $google2fa->verifyKey($this->currentUser->mfa->mfa_secret, $MFAcode);
            if ($valid) {
                return true;            
            } else {
                return false;
            }
        } catch (\Exception $e) {
            return false;
        }
        
    }

    public function authenticateWithBackupCode(Request $request)
    {
        // Check provided backup code against stored codes.
        // If correct, proceed with authentication and invalidate the used backup code.
    }

    public function getMFADetails(Request $request) {
        Log::info($request);
        try {
            if(!$this->currentUser) {
                return response()->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            $mfa = $this->currentUser->mfa;
            return response()->json(['mfa_enabled' => $mfa->mfa_enabled, 'is_pending' => $mfa->is_pending, 'is_set' => $mfa->is_set]);
        } catch(\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        

    }

    public function updateName(Request $request) {
        try {
            
            $this->currentUser->name = $request->name;
            $user->save();

            return response()->json(['Success' => 'Name changed']);
        } catch(\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        

    }

    public function validateGoogleUser(Request $request) {
        try {
            $token = $request->token;
        
            $client = new Google_Client(['client_id' => config('services.google.client_id')]);
            $access_token = new AccessToken();
            $payload = $access_token->verify($token, ['aud' => config('services.google.client_id')]);
        
            if (!$payload) {
                throw new \Exception('Invalid Google token.');
            }

        // Extract the user details from the payload.
            $name = $payload['name'];
            $email = $payload['email'];

            $existingUser = User::where('email', $email)->first();
            if(!$existingUser) {
                $existingUser = $this->createGoogleUser($email, $name);
                if(!$existingUser) {
                    return response()->json(['error' => "Couldn't create google user"], Response::HTTP_INTERNAL_SERVER_ERROR);
                }
            }

            return response()->json(['email' => $existingUser->email, 'name' => $existingUser->name, 'api_key' => $existingUser->apiKey->api_key]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    function createGoogleUser($email, $name) {
        try {
            $user = new User([
                'name' => $name,
                'email' => $email,
                'is_google_user' => true
            ]);
            
            $user->save(); 
            $apiKey = new Key(['api_key' => Str::random(32)]); // Generate an API key
            $user->apiKey()->save($apiKey);
            $mfa = new Mfa(); // Generate an API key
            $user->mfa()->save($mfa);
            $aws = new Aws(['external_id' => Str::random(20)]); // Generate an API key
            $user->awsCredentials()->save($aws);

            return $user;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    function getDefaultRegion() {
        try {
            return $this->currentUser->region;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    function setDefaultRegion(Request $request) {
        $jsonData = $request->json()->all();
        try {
            $this->currentUser->region = $jsonData['region'];
            $this->currentUser->save();
            return $this->currentUser->region;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    public function handleCaptcha($recaptchaValue)
    {
        $client = new Client();

        $response = $client->post('https://www.google.com/recaptcha/api/siteverify', [
            'form_params' => [
                'secret'   => env('RECAPTCHA_SECRET'),
                'response' => $recaptchaValue
            ]
        ]);

        $body = json_decode((string)$response->getBody());
    
        return $body->success;
    }

    public function forgotPasswordHandler(Request $request)
    {   
        
        try {
            $tokenRecieved = $request->input('token');
            $captcha = $request->input('captcha');
            $newPassword = $request->input('new_password');
            $token = Token::where('token', $tokenRecieved)->first();
            Log::info("token recieved: " . $tokenRecieved);
            Log::info("token: " . $token);    
            if(!$newPassword) {
                return response()->json(['error' => 'Password not sent'], 404);
            }
            
            if(!$token) {
                return response()->json(['error' => 'token was invalid'], 403);
            }



            if(!$this->handleCaptcha($captcha)) {
                return response()->json(['error' => 'token was invalid'], 403);
            }

            $this->currentUser->password = $newPassword;
            $this->currentUser->save();
            $token->delete(); 
            return response()->json(['message' => 'Password changed successfully'], Response::HTTP_OK);
        } catch(\Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
        
    }

    public function getExternalID() {
        return response()->json(['externalID' => $this->currentUser->awsCredentials->external_id]);
    }

}
