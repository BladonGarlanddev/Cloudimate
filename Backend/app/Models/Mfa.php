<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mfa extends Model
{
    protected $table = 'mfa_details';
    protected $fillable = [
        'mfa_enabled',
        'mfa_secret',
        'backup_codes'
    ];

    protected $casts = [
        'backup_codes' => 'array',
    ];

    use HasFactory;


    public function useBackupCode($code)
    {
        $codes = $this->backup_codes;
    
        if (in_array($code, $codes)) {
        // Invalidate the used backup code
            $codes = array_diff($codes, [$code]);
            $this->backup_codes = $codes;
            $this->save();

            return true;
        }      

        return false;
    }

    public function generateBackupCodes($num = 5)
    {
        $codes = [];
        for ($i = 0; $i < $num; $i++) {
            $codes[] = bin2hex(random_bytes(4));  // Generate 8-character codes
        }

        $this->backup_codes = $codes;
        $this->save();

        return $codes;  // Return them to display to the user, but only once!
    }
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
