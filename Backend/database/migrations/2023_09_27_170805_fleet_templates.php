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
        Schema::create('fleet_templates', function (Blueprint $table) {
            $table->increments('id');
            $table->string('template_name')->nullable(false);
            $table->text('description')->nullable();
            $table->string('fleet_type')->nullable(false);
            $table->string('instance_type')->nullable(false);
            $table->string('image_arn')->nullable(false);
            $table->integer('max_session')->nullable();
            $table->integer('disconnect_timeout')->nullable();
            $table->integer('idle_timeout')->nullable();
            $table->integer('min_cap')->nullable(false);
            $table->integer('max_cap')->nullable(false);
            $table->string('stream_view')->nullable(false);
            $table->json('scale_policy')->nullable();
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
        Schema::dropIfExists('fleet_templates');
    }
};
