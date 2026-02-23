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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')->constrained()->onDelete('cascade');

            // Pregnancy Information
            $table->integer('gestational_age_weeks')->nullable(); // âge gestationnel
            $table->date('last_menstrual_period')->nullable(); // DDR
            $table->date('expected_delivery_date')->nullable(); // DPA

            // Clinical Examination
            $table->decimal('weight', 5, 2)->nullable();
            $table->string('blood_pressure')->nullable();
            $table->integer('fetal_heart_rate')->nullable();
            $table->integer('uterine_height')->nullable();

            // Observations
            $table->text('symptoms')->nullable();
            $table->text('clinical_observations')->nullable();

            // Prescription & Advice
            $table->text('prescription')->nullable();
            $table->text('recommendations')->nullable();

            // Follow-up
            $table->date('next_visit_date')->nullable();

            // Generated PDF
            $table->string('pdf_path')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
