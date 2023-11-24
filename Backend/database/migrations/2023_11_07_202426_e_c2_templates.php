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
       Schema::create('EC2_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_name')->nullable(false);
            $table->string('description')->nullable();
            $table->string('instance_type')->nullable(false);
            $table->string('ami_id')->nullable(false);
            $table->string('security_group_ids')->nullable();
            $table->string('ebs_optimized')->nullable(false);
            $table->string('volume_size')->nullable(false);
            $table->string('volume_type')->nullable(false);
            $table->string('volume_size_unit')->nullable(false);
            $table->string('delete_on_termination')->nullable(false);
            $table->string('iam_role')->nullable();
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
       Schema::dropIfExists('EC2_templates');
    }
};
