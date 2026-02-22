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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('cin')->nullable()->unique();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();

            // Medical Information
            $table->enum('blood_group', [
                'A+', 'A-', 
                'B+', 'B-', 
                'AB+', 'AB-', 
                'O+', 'O-'
            ])->nullable();

            $table->text('allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->boolean('is_pregnant')->default(false);
            $table->longText('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
