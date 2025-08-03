<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // User registration
    public function register(Request $request)
    {
        Log::info("Register request: " . json_encode($request->all()));
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'email' => 'required|email|unique:users',
        ], [
            'name.required' => 'Name is required',
            'username.required' => 'Username is required',
            'username.unique' => 'Username already exists',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'email.required' => 'Email is required',
            'email.unique' => 'Email already exists',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            try {
                $token = JWTAuth::fromUser($user);
                
                // Get the current token payload
                $payload = JWTAuth::parseToken()->getPayload();
                
                // Calculate expiration time as Unix timestamp
                $expiration = now()->addMinutes(config('jwt.ttl'))->getTimestamp();
                
                // Set the expiration claim
                $payload->set('exp', (int)$expiration);
            } catch (JWTException $e) {
                throw new JwtException($e->getMessage(), 500, $e);
            } catch (\Exception $e) {
                throw new JwtException('Failed to create JWT token', 500, $e);
            }

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Registration failed'], 500);
        }
    }

    // User login
    public function login(Request $request)
    {
        try {
            Log::info("Starting login process");
            Log::info("Request data: " . json_encode($request->all()));
            
            // Validate credentials
            $credentials = $request->only('username', 'password');
            Log::info("Credentials: " . json_encode($credentials));
            
            $user = User::where('username', $request->username)->first();
            if (!$user) {
                Log::warning("User not found for username: " . $request->username);
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
            
            if (!Hash::check($request->password, $user->password)) {
                Log::warning("Invalid password for user: " . $user->id);
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
            
            Log::info("User authenticated successfully: " . $user->id);
            
            // Create token with proper TTL
            try {
                Log::info("Creating JWT token");
                $token = JWTAuth::fromUser($user);
                Log::info("Token created: " . $token);
                
                return response()->json([
                    'token' => $token,
                    'user' => $user,
                    'message' => 'Login successful'
                ]);
                
                } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
                    Log::error("JWTException: " . $e->getMessage());
                    Log::error("JWTException type: " . get_class($e));
                    Log::error("JWTException code: " . $e->getCode());
                    
                    return response()->json([
                        'error' => 'Could not create token',
                        'message' => $e->getMessage(),
                        'type' => get_class($e)
                    ], 500);
            }
            
            
        } catch (\Exception $e) {
            Log::error("General exception during login: " . $e->getMessage());
            Log::error("Exception type: " . get_class($e));
            Log::error("Exception code: " . $e->getCode());
            
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
                'type' => get_class($e)
            ], 500);
        }
    }   

    // Get authenticated user
    public function getUser()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['error' => 'User not found'], 404);
            }
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Invalid token'], 400);
        }
    }

    // User logout
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Successfully logged out']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout'], 500);
        }
    }

    // Reset password
    public function resetPassword(Request $request)
    {
        try {

            Log::info("Reset password request: " . json_encode($request->all()));

            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255',
                'password' => 'required|string|min:6|confirmed',
            ]);

            Log::info("Validator: " . json_encode($validator->errors()));
                if ($validator->fails()) {
                return response()->json($validator->errors()->toJson(), 400);
            }

            $user = User::where('username', $request->get('username'))->first();
            Log::info("User: " . json_encode($user));

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $user->password = Hash::make($request->get('password'));
            $user->save();

            return response()->json(['message' => 'Password reset successfully']);
        } catch (\Throwable $th) {
            Log::error('Reset password error: ' . $th->getMessage());
            return response()->json(['error' => 'Failed to reset password'], 500);
        }
    }
}
