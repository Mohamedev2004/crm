<?php

use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // DASHBOARD
    Route::get('/dashboard', function () {
        return Inertia::render('user/dashboard');
    })->name('dashboard');

    Route::prefix('admin')->group(function () {
        // NEWSLETTERS
        Route::prefix('newsletters')->name('newsletters.')->group(function () {

            // CRUD operations
            Route::get('/', [NewsletterController::class, 'index'])->name('index');
            Route::post('/', [NewsletterController::class, 'store'])->name('store');
            Route::put('/{id}', [NewsletterController::class, 'update'])->name('update');
            Route::delete('/{id}', [NewsletterController::class, 'destroy'])->name('destroy');

            // Restore & Bulk actions
            Route::post('/{id}/restore', [NewsletterController::class, 'restore'])->name('restore');
            Route::post('/restore-all', [NewsletterController::class, 'restoreAll'])->name('restore-all');
            Route::post('/bulk-delete', [NewsletterController::class, 'bulkDelete'])->name('bulk-delete');
        });

        // NOTIFICATIONS
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::post('/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('markAsRead');
            Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
        });
    });
});

require __DIR__.'/settings.php';
