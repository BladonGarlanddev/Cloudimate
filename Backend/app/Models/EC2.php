<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EC2 extends Model
{
    use HasFactory;

    protected $table = 'EC2_templates';
    protected $hidden = ['user_id'];
    public $timestamps = false;

    protected $fillable = [
        'template_name',
        'description',
        'instance_type',
        'ami_id',
        'security_group_ids',
        'ebs_optimized',
        'volume_size',
        'volume_type',
        'volume_size_unit',
        'delete_on_termination',
        'iam_role'
    ];

    protected $casts = [
        'security_group_ids' => 'array',
        'iam_role' => 'array',
        'delete_on_termination' => 'boolean',
        'ebs_optimized' => 'boolean',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
