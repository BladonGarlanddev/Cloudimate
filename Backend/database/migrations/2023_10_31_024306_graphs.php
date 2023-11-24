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
        Schema::create('Graphs', function (Blueprint $table) {
            $table->id(); // Use the "id" method to create a primary key
            $table->string('resource_id', 80)->nullable(false);
            $table->string('resource_type', 80)->nullable(false);
            $table->string('metric', 80)->nullable(false);
            $table->unsignedInteger('user_id'); // Use "unsignedInteger" for consistency
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
