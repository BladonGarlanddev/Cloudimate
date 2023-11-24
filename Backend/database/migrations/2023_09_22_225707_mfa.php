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
        Schema::create('mfa_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id'); // Foreign key to users table
            $table->string('mfa_secret')->nullable(); // Secret used for generating OTP codes
            $table->boolean('mfa_enabled')->default(false); // To know if MFA is enabled for the user
            $table->text('backup_codes')->nullable(); 
            $table->boolean('is_pending')->default(false);
            $table->boolean('is_set')->default(false);// Backup codes for MFA
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mfa');
    }
};
