<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\DealController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommercialController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\TransactionController;
use Inertia\Inertia;


//------------------------------ PUBLIC ROUTES ------------------------------//
Route::middleware(['guest'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');
});



//------------------------------ ADMIN ROUTES ------------------------------//
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('finance', [FinanceController::class, 'index'])->name('finance');

    Route::get('/commercials', [CommercialController::class, 'index'])->name('admin.commercials');  
    Route::post('/commercials', [CommercialController::class, 'store'])->name('admin.commercials.store'); 
    Route::put('/commercials/{id}', [CommercialController::class, 'update'])->name('admin.commercials.update'); 
    Route::delete('/commercials/{id}', [CommercialController::class, 'destroy'])->name('admin.commercials.destroy'); 

    Route::get('/clients', [ClientController::class, 'index'])->name('admin.clients');
    Route::post('/clients', [ClientController::class, 'store'])->name('admin.clients.store');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('admin.clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->name('admin.clients.destroy');

    Route::get('/leads', [LeadController::class, 'index'])->name('admin.leads');
    Route::post('/leads', [LeadController::class, 'store'])->name('admin.leads.store');
    Route::put('/leads/{lead}', [LeadController::class, 'update'])->name('admin.leads.update');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->name('admin.leads.destroy');
    Route::patch('/leads/{lead}/status/new', [LeadController::class, 'setNew'])->name('admin.leads.setNew');
    Route::patch('/leads/{lead}/status/contacted', [LeadController::class, 'setContacted'])->name('admin.leads.setContacted');
    Route::patch('/leads/{lead}/status/qualified', [LeadController::class, 'setQualified'])->name('admin.leads.setQualified');
    Route::patch('/leads/{lead}/status/converted', [LeadController::class, 'setConverted'])->name('admin.leads.setConverted');
    Route::patch('/leads/{lead}/status/lost', [LeadController::class, 'setLost'])->name('admin.leads.setLost');

    Route::get('/deals', [DealController::class, 'index'])->name('admin.deals');
    Route::post('/deals/{deal}/set-stage/{stage}', [DealController::class, 'setStage'])->name('admin.deals.setStage');
    // Optional: convenience routes for each stage
    Route::post('/deals/{deal}/lead', [DealController::class, 'setLead'])->name('admin.deals.setLead');
    Route::post('/deals/{deal}/proposal', [DealController::class, 'setProposal'])->name('admin.deals.setProposal');
    Route::post('/deals/{deal}/negotiation', [DealController::class, 'setNegotiation'])->name('admin.deals.setNegotiation');
    Route::post('/deals/{deal}/closed-won', [DealController::class, 'setClosedWon'])->name('admin.deals.setClosedWon');
    Route::post('/deals/{deal}/closed-lost', [DealController::class, 'setClosedLost'])->name('admin.deals.setClosedLost');

    Route::get('/revenues', [RevenueController::class, 'index'])->name('admin.revenues');

    Route::get('/tasks', [TaskController::class, 'index'])->name('admin.tasks');
    Route::post('/tasks', [TaskController::class, 'store'])->name('admin.tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('admin.tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('admin.tasks.destroy');
    Route::put('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('admin.tasks.updateStatus');

    Route::get('/appointments', [AppointmentController::class, 'index'])->name('admin.appointments');
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::post('/appointments/{id}/confirmed', [AppointmentController::class, 'setConfirmed'])->name('appointments.setConfirmed');
    Route::post('/appointments/{id}/completed', [AppointmentController::class, 'setCompleted'])->name('appointments.setCompleted');
    Route::post('/appointments/{id}/cancelled', [AppointmentController::class, 'setCancelled'])->name('appointments.setCancelled');
    Route::post('/appointments/confirm-many', [AppointmentController::class, 'confirmMany'])->name('appointments.confirmMany');
    Route::post('/appointments/cancel-many', [AppointmentController::class, 'cancelMany'])->name('appointments.cancelMany');
    Route::post('/appointments/complete-many', [AppointmentController::class, 'completeMany'])->name('appointments.completeMany');
    Route::get('/appointment-calendar', [AppointmentController::class, 'getAppointmentCalendar']);
    Route::get('/available-appointment-dates', [AppointmentController::class, 'getAvailableAppointmentDates']);

    Route::get('/transactions', [TransactionController::class, 'index'])->name('admin.transactions');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('admin.transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('admin.transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('admin.transactions.destroy');

    Route::get('/invoices', [InvoiceController::class, 'index'])->name('admin.invoices');
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('admin.invoices.store');
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('admin.invoices.update');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('admin.invoices.destroy');
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('admin.invoices.download');
    Route::post('/invoices/{invoice}/set-paid', [InvoiceController::class, 'setPaid'])->name('admin.invoices.setPaid');
    Route::post('/invoices/{invoice}/set-overdue', [InvoiceController::class, 'setOverdue'])->name('admin.invoices.setOverdue');


});



//------------------------------ Client ROUTES ------------------------------//
Route::prefix('client')->middleware(['auth', 'client'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('client/dashboard');
    })->name('client.dashboard');
});


//------------------------------ Commercial ROUTES ------------------------------//
Route::prefix('commercial')->middleware(['auth', 'commercial'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('commercial/dashboard');
    })->name('commercial.dashboard');
});

require __DIR__.'/settings.php';
