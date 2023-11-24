<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Environment_template extends Model
{
    use HasFactory;

    protected $table = 'environment_templates';
    protected $fillable = ['environment_structure', 'template_name'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
