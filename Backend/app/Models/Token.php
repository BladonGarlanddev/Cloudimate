<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Token extends Model
{
    protected $table = 'oneTimeTokens';
    protected $fillable = [
        'token'
    ];
    

    use HasFactory;
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
