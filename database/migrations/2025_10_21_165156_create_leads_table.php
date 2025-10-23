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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // lead name or company
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('service');
            $table->enum('source', ['social', 'email', 'call', 'others']);
            $table->enum('status', ['new', 'contacted', 'qualified', 'converted', 'lost'])->default('new');
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete(); // client
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete(); // commercial
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
