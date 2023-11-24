<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id(); // Use the "id" method to create a primary key
            $table->string('api_key', 80)->unique()->nullable();
            $table->boolean('valid')->default(false);
            $table->unsignedInteger('user_id'); // Use "unsignedInteger" for consistency
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};
