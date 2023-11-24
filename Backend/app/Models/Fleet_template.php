<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fleet_template extends Model
{
    use HasFactory;

    protected $table = 'fleet_templates';
    public $timestamps = false;

    protected $fillable = [
    'template_name',
    'description',
    'fleet_type',
    'instance_type',
    'max_session',
    'disconnect_timeout',
    'idle_timeout',
    'min_cap',
    'max_cap',
    'stream_view',
    'scale_policy',
    'image_arn'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
