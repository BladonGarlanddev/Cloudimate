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
        Schema::create('cron_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_name')->nullable(false);
            $table->string('description')->nullable();
            $table->string('hour')->nullable(false);
            $table->string('minute')->nullable(false);
            $table->string('month')->nullable(false);
            $table->string('day_of_month')->nullable(false);
            $table->string('day_of_week')->nullable(false);
            $table->string('year')->nullable();
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'template_name']);
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cron_templates');    
    }
};
