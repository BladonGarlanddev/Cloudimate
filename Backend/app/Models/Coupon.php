<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'coupons';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    /*
    protected $fillable = [
        'code', 'description', 'discount_type', 'discount_value', 'start_date', 
        'end_date', 'usage_limit', 'usage_per_user', 'min_order_value', 'is_active'
    ];
    */
    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = [
        'code', 'description', 'discount_type', 'discount_value', 'start_date', 
        'end_date', 'usage_limit', 'usage_per_user', 'min_order_value', 'is_active', 'start_date', 'end_date', 'created_at', 'updated_at'
    ];
}

