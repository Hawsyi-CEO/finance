<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Debug logging
        Log::info('Login attempt - Raw request:', [
            'all_data' => $request->all(),
            'email' => $request->email,
            'password_exists' => $request->has('password'),
            'password_length' => strlen($request->password ?? ''),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method()
        ]);

        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }

        $user = User::where('email', $request->email)->first();
        
        Log::info('User found:', [
            'user_exists' => !!$user,
            'user_email' => $user ? $user->email : null
        ]);

        if (!$user) {
            Log::info('User not found for email: ' . $request->email);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $passwordMatches = Hash::check($request->password, $user->password);
        Log::info('Password check result:', ['matches' => $passwordMatches]);

        if (!$passwordMatches) {
            Log::info('Password does not match for user: ' . $user->email);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('Login successful for user: ' . $user->email);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
