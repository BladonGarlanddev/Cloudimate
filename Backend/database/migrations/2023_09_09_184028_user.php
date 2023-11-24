<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('password', 255)->nullable();
            $table->string('street_address', 100);
            $table->string('city', 80);
            $table->string('zip', 10);
            $table->string('state', 40);
            $table->string('stripe_id', 100)->nullable()->unique();
            $table->string('subscription_id', 100)->nullable()->unique();
            $table->boolean('is_google_user')->default(false);
            $table->string('region', 63)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};



