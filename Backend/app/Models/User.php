<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
    protected $fillable = [
        'name',
        'email',
        'password',
        'street_address',
        'city',
        'zip',
        'state',
        'stripe_id',
        'subscription_id',
        'region'
    ];

    protected $hidden = [
        'password',
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = bcrypt($value);
    }
    
    public function apiKey()
    {
        return $this->hasOne(Key::class);
    }

    public function awsCredentials()
    {
        return $this->hasOne(Aws::class);
    }

    public function token()
    {
        return $this->hasOne(Token::class);
    }

    public function mfa()
    {
        return $this->hasOne(Mfa::class);
    }

    public function fleetTemplates()
    {
        return $this->hasMany(Fleet_template::class);
    }

    public function cronTemplates()
    {
        return $this->hasMany(Cron_template::class);
    }

    public function environmentTemplates()
    {
        return $this->hasMany(Environment_template::class);
    }

    public function graphs()
    {
        return $this->hasMany(Graph::class);
    }

    public function EC2Templates()
    {
        return $this->hasMany(EC2::class);
    }

    public function RDSTemplates()
    {
        return $this->hasMany(RDS::class);
    }


}
