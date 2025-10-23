<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // Link to the user who owns the invoice
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Basic invoice info
            $table->string('invoice_number')->unique();
            $table->string('title'); // e.g. "Website Development Invoice"
            $table->text('description')->nullable(); // optional details

            // Financials
            $table->decimal('amount', 12, 2); // total amount due
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2); // final amount after tax/discount

            // Status & due dates
            $table->enum('status', ['pending', 'overdue', 'paid'])->default('pending');
            $table->date('due_date')->nullable();

            // File storage
            $table->string('file_path')->nullable()
                ->comment('Path to generated or uploaded invoice PDF');

            // Metadata
            $table->string('currency', 10)->default('USD');
            $table->string('client_name')->nullable();
            $table->string('client_email')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
