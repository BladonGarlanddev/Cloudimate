<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Graph extends Model
{
    use HasFactory;

    protected $table = 'Graphs';

    protected $fillable = [
    'resource_id',
    'resource_type',
    'metric'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
