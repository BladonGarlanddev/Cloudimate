<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Key extends Model
{
    protected $table = 'api_keys';
    protected $fillable = [
        'api_key',
        'valid'
    ];
    

    use HasFactory;
    public static function convertFormat($apiKey) {
        $convertedKey = str_replace('Bearer','',$apiKey);
        $convertedKey = str_replace(' ','',$convertedKey);
        return $convertedKey;
    }
    public static function isValid($apiKey, $email)
    {   
        $convertedKey = self::convertFormat($apiKey);
        $apiKeyModel = static::where('api_key', $convertedKey)->first();

        if (!$apiKeyModel || !$apiKeyModel->valid) {
            return false;
        }

        $associatedEmail = $apiKeyModel->user->email ?? null;
        
        if ($email != null && $associatedEmail === $email) {
            return true;
        }

        return false;
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
