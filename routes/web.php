<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\KanbanController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
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
            Route::get('/{patient}/reports/create', [ReportController::class, 'create'])->name('report.create');
            Route::post('/{patient}/reports', [ReportController::class, 'store'])->name('report.store');
            Route::get('/{patient}/reports/{report}', [ReportController::class, 'show'])->name('reports.show');
            Route::get('/{patient}/reports/{report}/download', [ReportController::class, 'downloadPdf'])->name('reports.download');

            // Restore & Bulk actions
            Route::post('/{id}/restore', [PatientController::class, 'restore'])->name('restore');
            Route::post('/restore-all', [PatientController::class, 'restoreAll'])->name('restore-all');
            Route::post('/bulk-delete', [PatientController::class, 'bulkDelete'])->name('bulk-delete');
        });

        // TASKS
        Route::prefix('tasks')->name('tasks.')->group(function () {
            Route::get('/', [TaskController::class, 'index'])->name('index');
            Route::post('/', [TaskController::class, 'store'])->name('store');
            Route::put('/{task}', [TaskController::class, 'update'])->name('update');
            Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
            Route::put('/{task}/status', [TaskController::class, 'updateStatus'])->name('updateStatus');
            Route::post('/selected/done', [TaskController::class, 'setSelectedDone'])->name('setSelectedDone');
            Route::post('/selected/in-progress', [TaskController::class, 'setSelectedInProgress'])->name('setSelectedInProgress');
            Route::post('/selected/pending', [TaskController::class, 'setSelectedPending'])->name('setSelectedPending');
        });

        // APPOINTMENTS
        Route::prefix('appointments')->name('appointments.')->group(function () {
            Route::get('/', [AppointmentController::class, 'index'])->name('index');
            Route::post('/', [AppointmentController::class, 'store'])->name('store');
            Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('update');
            Route::post('/confirm-many', [AppointmentController::class, 'confirmMany'])->name('confirmMany');
            Route::post('/cancel-many', [AppointmentController::class, 'cancelMany'])->name('cancelMany');
            Route::post('/complete-many', [AppointmentController::class, 'completeMany'])->name('completeMany');
            Route::post('/{id}/confirm', [AppointmentController::class, 'setConfirmed'])->name('setConfirmed');
            Route::post('/{id}/cancel', [AppointmentController::class, 'setCancelled'])->name('setCancelled');
            Route::post('/{id}/complete', [AppointmentController::class, 'setCompleted'])->name('setCompleted');
        });

        // KANBAN
        Route::prefix('kanban')->name('kanban.')->group(function () {
            Route::get('/', [KanbanController::class, 'index'])->name('index');
            Route::post('/', [KanbanController::class, 'store'])->name('store');
            Route::patch('/{task}/status', [KanbanController::class, 'updateStatus'])->name('updateStatus');
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
