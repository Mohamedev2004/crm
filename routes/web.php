<?php

use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReportController;
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

        // PATIENTS
        Route::prefix('patients')->name('patients.')->group(function () {

            // CRUD operations
            Route::get('/', [PatientController::class, 'index'])->name('index');
            Route::get('/{patient}', [PatientController::class, 'show'])->name('show');
            Route::post('/basic', [PatientController::class, 'storeBasicInfos'])->name('storeBasicInfos');
            Route::post('/{patient}/medical', [PatientController::class, 'storeMedicalInfos'])->name('storeMedicalInfos');
            Route::put('/{id}', [PatientController::class, 'updateBasicInfos'])->name('updateBasicInfos');
            Route::put('/{patient}/medical', [PatientController::class, 'updateMedicalInfos'])->name('updateMedicalInfos');
            Route::delete('/{id}', [PatientController::class, 'destroy'])->name('destroy');
            // REPORTS
            Route::post('/{patient}/reports', [ReportController::class, 'store'])->name('report.store');

            // Restore & Bulk actions
            Route::post('/{id}/restore', [PatientController::class, 'restore'])->name('restore');
            Route::post('/restore-all', [PatientController::class, 'restoreAll'])->name('restore-all');
            Route::post('/bulk-delete', [PatientController::class, 'bulkDelete'])->name('bulk-delete');
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
