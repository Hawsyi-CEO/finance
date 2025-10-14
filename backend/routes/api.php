<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeePaymentController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransactionGroupsController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::options('/login', function() {
    return response()->json(['status' => 'ok']);
});

// Debug route to check users
Route::get('/debug/users', function() {
    $users = \App\Models\User::all(['id', 'name', 'email', 'role']);
    return response()->json($users);
});

// Debug route to test password
Route::post('/debug/test-password', function(\Illuminate\Http\Request $request) {
    $user = \App\Models\User::where('email', $request->email)->first();
    if (!$user) {
        return response()->json(['error' => 'User not found']);
    }
    
    $passwordCheck = \Illuminate\Support\Facades\Hash::check($request->password, $user->password);
    
    return response()->json([
        'user_exists' => true,
        'password_matches' => $passwordCheck,
        'stored_hash' => $user->password,
        'input_password' => $request->password
    ]);
});

// Simple test route
Route::post('/debug/test', function(\Illuminate\Http\Request $request) {
    return response()->json([
        'message' => 'Test successful',
        'data' => $request->all(),
        'headers' => $request->headers->all()
    ]);
});

// Simple login test route
Route::post('/debug/simple-login', function(\Illuminate\Http\Request $request) {
    try {
        $email = $request->input('email');
        $password = $request->input('password');
        
        if (!$email || !$password) {
            return response()->json(['error' => 'Email and password required'], 400);
        }
        
        $user = \App\Models\User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        if (!\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Password incorrect'], 401);
        }
        
        $token = $user->createToken('debug-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['error' => 'Exception: ' . $e->getMessage()], 500);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    // Transactions
    Route::get('/transactions/statistics', [TransactionController::class, 'statistics']);
    Route::apiResource('transactions', TransactionController::class);
    
    // Transaction Groups
    Route::get('/transaction-groups/options', [TransactionGroupsController::class, 'options']);
    Route::apiResource('transaction-groups', TransactionGroupsController::class);
    
    // Employee Payments (Finance only)
    Route::middleware('role:finance')->group(function () {
        Route::get('/employee-payments/employees', [EmployeePaymentController::class, 'employees']);
        Route::post('/employee-payments/{employeePayment}/approve', [EmployeePaymentController::class, 'approve']);
        Route::apiResource('employee-payments', EmployeePaymentController::class);
    });
    
    // Users (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });
    
    // Test route
    Route::get('/test', [TestController::class, 'test']);
});