<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Aws\Kms\KmsClient;
use Illuminate\Support\Facades\Log;


class Aws extends Model
{
    public $timestamps = false;
    
    protected $table = 'aws';
    protected $fillable = [
        'arn',
        'external_id'
    ];
    
    use HasFactory;

    public function setAwsCredentials($arn)
    {
        Log::info("MODEL RAN");
        // Create a KMS client
        $kms = new KmsClient([
            'version' => 'latest',
            'region' => 'us-east-2', // Replace with your AWS region
        ]);

        // Your plaintext data (e.g., AWS Access Key and Secret Access Key)
        $resultARN = $kms->encrypt([
            'KeyId' => config('services.aws.kms_key'),
            'Plaintext' => $arn,
        ]);

    // Encrypt the secret_access_key
       

        // Store the encrypted data in the model
        $this->arn = $resultARN['CiphertextBlob'];
    }

    public function decodeCredential($encryptedData) {
        $kms = new KmsClient([
            'version' => 'latest',
            'region' => 'us-east-2', // Replace with your AWS region
        ]);

    // Decrypt the data
        $result = $kms->decrypt([
            'KeyId' => config('services.aws.kms_key'),
            'CiphertextBlob' => $encryptedData, 
        ]);

        return $result['Plaintext'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
