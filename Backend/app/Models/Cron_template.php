<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cron_template extends Model
{
    use HasFactory;

    protected $hidden = ['user_id'];

    public $timestamps = false;

    protected $fillable = [
        'template_name',
        'description',
        'hour',
        'minute',
        'month',
        'day_of_month',
        'day_of_week',
        'year'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
