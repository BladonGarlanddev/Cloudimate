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
        Schema::create("RDS_templates", function(Blueprint $table) {
            $table->id();
            $table->string("template_name")->nullable(false);
            $table->string('description')->nullable();
            $table->string("engine")->nullable(false);
            $table->string("engine_version")->nullable(false);
            $table->string("license")->nullable();
            $table->string("instance_type")->nullable(false);
            $table->string("storage_type")->nullable();
            $table->string("master_username")->nullable();
            $table->string("master_user_password")->nullable();
            $table->integer("allocated_storage")->nullable();
            $table->string("retention_period")->nullable();
            $table->string("storage_encrypted")->nullable();
            $table->json("security_group_ids")->nullable();
            $table->boolean("attach_to_instance")->nullable(false);
            $table->json("associated_EC2_instance")->nullable();
            $table->string("database_authentication")->nullable(false);
            $table->boolean("performance_insights")->nullable(false);
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
        Schema::dropIfExists('RDS_templates');
    }
};
