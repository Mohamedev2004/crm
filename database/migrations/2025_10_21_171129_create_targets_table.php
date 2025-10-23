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
        Schema::create('targets', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Name of the target
            $table->decimal('goal_amount', 12, 2); // Target goal
            $table->decimal('achieved_amount', 12, 2)->default(0); // Progress so far
            $table->date('start_date'); // Target start date
            $table->date('end_date');   // Target end date
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('targets');
    }
};
