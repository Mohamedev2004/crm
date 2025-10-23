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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->decimal('value', 12, 2)->default(0);
            $table->enum('stage', ['lead', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])->default('lead');
            $table->text('notes')->nullable();

            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete(); // same client
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete(); // commercial or admin who created deal

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
