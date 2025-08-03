<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\CategoryController;
use App\Http\Middleware\JwtMiddleware;

// Route::apiResource('menu', MenuController::class)->middleware(CorsMiddleware::class);


Route::middleware('throttle:60,1')->group(function () {

    Route::middleware(CorsMiddleware::class)->group(function () {
        Route::get('/menu', [MenuController::class, 'index']); // Get all menu
        Route::get('/menu/category/{id}', [MenuController::class, 'showByCategory']); // Get menu by category
        Route::get('/menu/categories', [CategoryController::class, 'index']); // Get all categories
        Route::get('/menu/{id}', [MenuController::class, 'show']); // Get menu by id
        // Route::post('/menu', [MenuController::class, 'store']);
        // Route::put('/menu/{id}', [MenuController::class, 'update']);
        // Route::delete('/menu/{id}', [MenuController::class, 'destroy']);
    });

    Route::prefix('admin')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        // Route::middleware('auth:api')->group(function () {
            Route::get('/user', [AuthController::class, 'getUser']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('reset-password', [AuthController::class, 'resetPassword']);

            // Menu Management
            Route::get('/menu', [MenuController::class, 'index']); // Get all menu
            Route::post('/menu', [MenuController::class, 'store']);
            Route::put('/menu/{id}', [MenuController::class, 'update']);
            Route::get('/menu/{id}', [MenuController::class, 'show']);
            Route::delete('/menu/{id}', [MenuController::class, 'destroy']);

            Route::get('/menu/category/{id}', [MenuController::class, 'showByCategory']); // Get menu by category

            // Category Management
            Route::get('/categories', [CategoryController::class, 'index']); // Get all categories
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::get('/categories/{id}', [CategoryController::class, 'show']);
            Route::put('/categories/{id}', [CategoryController::class, 'update']);
            Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
        // });
    });
});
