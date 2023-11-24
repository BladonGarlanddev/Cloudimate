<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RDS extends Model
{
    use HasFactory;

    protected $table = 'RDS_templates';
    protected $hidden = ['user_id'];
    public $timestamps = false;

    protected $fillable = [
        'template_name',
        'description',
        'instance_type',
        'engine',
        'engine_version',
        'license',
        'storage_type',
        'master_username',
        'master_user_password',
        'allocated_storage',
        'retention_period',
        'storage_encrypted',
        'license_model',
        'multi_az_deployment',
        'attach_to_instance',
        'associated_EC2_instance',
        'security_group_ids',
        'database_authentication',
        'performance_insights'
    ];

    protected $casts = [
        'security_group_ids' => 'array',
        'associated_EC2_instance' => 'array',
        'attach_to_instance' => 'boolean',
        'ebs_optimized' => 'boolean',
        'performance_insights' => 'boolean',
        'iam_database_authentication' => 'boolean',
        'storage_encrypted'           => 'boolean'
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
