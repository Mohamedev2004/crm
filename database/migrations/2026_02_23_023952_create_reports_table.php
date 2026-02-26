<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();

            // Pregnancy Information (Required Core Data)
            $table->integer('gestational_age_weeks'); // REQUIRED
            $table->date('last_menstrual_period')->nullable();
            $table->date('expected_delivery_date')->nullable();

            // Clinical Examination (Important core data)
            $table->decimal('weight', 5, 2); // REQUIRED
            $table->string('blood_pressure'); // REQUIRED
            $table->integer('fetal_heart_rate'); // REQUIRED
            $table->integer('uterine_height')->nullable();

            // Observations (Optional but recommended)
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
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};