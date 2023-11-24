<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Env_template extends Model
{
    use HasFactory;

    protected $table = 'network_templates';
    protected $fillable = ['network_structure', 'template_name'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
