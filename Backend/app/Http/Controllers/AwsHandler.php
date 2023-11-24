<?php

namespace App\Http\Controllers;

use Illuminate\Support\Collection;
use App\Models\Aws;
use App\Models\User;
use App\Models\Fleet_template;
use App\Models\Cron_template;
use App\Models\Environment;
use App\Models\Graph;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Aws\Organizations\OrganizationsClient;
use Aws\Sts\StsClient;
use Aws\Iam\IamClient;
use Aws\Appstream\AppstreamClient;
use Aws\Laravel\AwsFacade;
use Aws\Ec2\Ec2Client;
use Aws\Rds\RdsClient;
use Aws\CloudWatch\CloudWatchClient;
use DateTime;
use DateInterval;
use Aws\CostExplorer\CostExplorerClient;

class AwsHandler extends Controller
{
    protected $currentUser;
    protected $credentials;
    protected $region;

    public function __construct(Request $request) {
        try {
            $email = $request->header('X-User-Email');
            $this->region = $request->header('X-Region');
            $this->currentUser = User::where('email', $email)->first();
            
            $awsCredentials = $this->currentUser->awsCredentials;
            $arn = $awsCredentials->decodeCredential($awsCredentials->arn);
            $externalID = $awsCredentials->external_id;
            $ec2Client = new StsClient([
                'version'=>'latest',
                'region' => $this->region,
            ]);
            
            $assumerRole = $ec2Client->assumeRole([
                'RoleArn' => config('services.aws.assumer_role_arn'),
                'RoleSessionName' => 'Asummer_session',
            ]);


            $assumedStsClient = new StsClient([
                'version' => 'latest',
                'region' => $this->region,
                'credentials' => [
                    'key' => $assumerRole['Credentials']['AccessKeyId'],
                    'secret' => $assumerRole['Credentials']['SecretAccessKey'],
                    'token' => $assumerRole['Credentials']['SessionToken']
                ]
            ]);
            
            if (empty($externalID) || strlen($externalID) < 2) {
                Log::error('Invalid ExternalId value');
                return;
            }

            $CloudimateRole = $assumedStsClient->assumeRole([
                'RoleArn' => $arn,
                'RoleSessionName' => 'Cloudimate_session',
                'ExternalId' => $externalID
            ]);

            if(!$CloudimateRole) {
                Log::info("Could not assume role");
                return response()->json(['error' => 'could not assume role']);
            }
            $this->credentials = $CloudimateRole['Credentials'];
        } catch (\Exception $e) {
            Log::error($e);
            return response()->json(['error' => 'constructor failed. Was not able to assume role.']);
        }
    }

    public function testConstructor() {
        return response()->json(['AccessKeyId' => $this->credentials['AccessKeyId'], 'SecretAccessKey' => $this->credentials['SecretAccessKey'], 'SessionToken' => $this->credentials['SessionToken']]);            
    }

    public function getAccounts() {
    // Create an AWS Organizations client
        $orgClient = new OrganizationsClient([
            'version' => 'latest',
            'region' => $this->region,
            'credentials' => [
                'key' => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token' => $this->credentials['SessionToken']
            ]
            ]);
        try {
        // List accounts
            $result = $orgClient->listAccounts();
        // Extract just the accounts info from the result
            $accounts = $result->get('Accounts');
            return response()->json($accounts);

        } catch (\Aws\Organizations\Exception\OrganizationsException $e) {
        // Handle error - e.g., missing permissions, not part of an organization, etc.
            try {
                $iamClient = new IamClient([
                    'version' => 'latest',
                    'region'  => $this->region, // IAM is a global service, but you still need to set a default region
                    'credentials' => [
                        'key' => $this->credentials['AccessKeyId'],
                        'secret' => $this->credentials['SecretAccessKey'],
                        'token' => $this->credentials['SessionToken']
                    ],
                ]);

                $result = $iamClient->listAccountAliases();

                if ($result['AccountAliases']) {
                    $alias = $result['AccountAliases'][0]; // Grabbing the first alias
                } else {
                    $alias = $identity->get('Account'); // fallback to account ID
                }

                return $alias;

            } catch (\Aws\Sts\Exception\StsException $stsException) {
            // Handle the error if STS call also fails
                return response()->json(['error' => $stsException->getMessage()], 400);
            }
        }
    }

    public function indexFleets() {
        try {
            $appStreamClient = new AppstreamClient([
                'version' => 'latest',
                'region' => $this->region, // Change to your AWS region if different
                'credentials' => [
                    'key' => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token' => $this->credentials['SessionToken']
                ]
            ]);

            $result = $appStreamClient->describeFleets();
        
                // Extract fleet details
            $fleets = $result['Fleets'];

                // Return fleets or process as needed
            return $fleets;

        } catch (\Exception $e) {
                Log::error($e);
        }
    }
    
    public function startFleet(Request $request)
    {
    // Get fleet name from request
        $fleetName = $request->input('name');
    // If fleetName is not provided, return an error response
        if (!$fleetName) {
            return response()->json(['error' => 'fleetName is required'], 400);
        }

    // Create an AppStream client
        $client = new AppStreamClient([
            'region'  => $this->region,  // Update the region as per your setup
            'version' => 'latest',    // Or specify the version you want
            'credentials' => [    // Uncomment and provide these if they're not set in your environment
                'key' => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token' => $this->credentials['SessionToken']
            ],
        ]);

        try {
            $result = $client->startFleet(['Name' => $fleetName]);
            return response()->json(['message' => 'Fleet started successfully', 'data' => $result]);
        } catch (\Aws\Exception\AwsException $e) {
        // Handle the AWS error
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function stopFleet(Request $request)
    {
    // Get fleet name from request
        $fleetName = $request->input('name');
    // If fleetName is not provided, return an error response
        if (!$fleetName) {
            return response()->json(['error' => 'fleetName is required'], 400);
        }

    // Create an AppStream client
        $client = new AppStreamClient([
            'region'  => $this->region,  // Update the region as per your setup
            'version' => 'latest',    // Or specify the version you want
            'credentials' => [    // Uncomment and provide these if they're not set in your environment
                'key' => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token' => $this->credentials['SessionToken']
            ],
        ]);

        try {
            $result = $client->stopFleet(['Name' => $fleetName]);
            return response()->json(['message' => 'Fleet stopped successfully', 'data' => $result]);
        } catch (\Aws\Exception\AwsException $e) {
        // Handle the AWS error
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteFleet(Request $request)
    {
    // Get fleet name from request
        $fleetName = $request->input('name');

    // If fleetName is not provided, return an error response
        if (!$fleetName) {
            return response()->json(['error' => 'fleetName is required'], 400);
        }

    // Create an AppStream client
        $client = new AppStreamClient([
            'region'      => $this->region,  // Update the region as per your setup
            'version'     => 'latest',       // Or specify the version you want
            'credentials' => [               // Uncomment and provide these if they're not set in your environment
                'key'    => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token'  => $this->credentials['SessionToken']
            ],
        ]);

        try {
            $result = $client->deleteFleet(['Name' => $fleetName]);
            return response()->json(['message' => 'Fleet deleted successfully', 'data' => $result]);
        } catch (\Aws\Exception\AwsException $e) {
            // Handle the AWS error
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function makeFleet(Request $request) {
        Log::info($request->template_name);
        $template = $this->currentUser->fleetTemplates()->where('template_name', $request->template_name)->first();
        
        if(!$template) {
            return response()->json(['error' => 'template not found']);
        }
        
        try {
            $appStreamClient = new AppstreamClient([
                'version' => 'latest',
                'region' => $this->region,
                'credentials' => [
                    'key' => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token' => $this->credentials['SessionToken']
                ]
            ]);
            
            Log::info("Computed MaxUserDurationInSeconds: " . ($template->idle_timeout * 60));

            $result = $appStreamClient->createFleet([
        // replace these with the desired values for your fleet
                'Name' => $template->template_name,
                'InstanceType' => $template->instance_type,
                'ImageArn' => $template->image_arn,
                'ComputeCapacity' => [
                    'DesiredInstances' => $template->max_session // or any relevant field
                ],
                'DisconnectTimeoutInSeconds' => $template->disconnect_timeout,
                'MaxUserDurationInSeconds' => $template->idle_timeout * 60,
                'FleetType' => $template->fleet_type,
                'Description' => $template->description,
                'DisplayName' => $template->template_name,
                'StreamView' => $template->stream_view,
            ]);

            if($result) {
                return response()->json(['success' => 'Created fleet successfully']);
            } else {
                return response()->json(['Failure' => 'Fleet creation failed']);
            }

            Log::info("Fleet created:", $result->toArray());
            } catch (\Exception $e) {
                Log::error($e);
            }
    }

    public function describeImages() {
        $appStreamClient = AwsFacade::createClient('appstream', [
            'version' => 'latest',
            'region' => $this->region,
            'credentials' => [
                'key'    => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token'  => $this->credentials['SessionToken']
            ]
        ]);

        try {
            $result = $appStreamClient->describeImages();

            $images = $result->get('Images');

            return response()->json($images);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    function generateRandomPassword($length = 12) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
        $charactersLength = strlen($characters);
        $randomPassword = '';
        for ($i = 0; $i < $length; $i++) {
            $randomPassword .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomPassword;
    }

    function generateTxtFile($rdsObjects) {
        $fileContent = "";
        foreach ($rdsObjects as $rds) {
            $fileContent .= "name: " . $rds->name . "\n";
            $fileContent .= "password: " . $rds->password . "\n\n";
        }

// Create a Response for Download
        return response($fileContent)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', 'attachment; filename="rds_passwords.txt"');
    }

    public function createEnvironmentStructure(Request $request)
    {
        $template = $this->currentUser->environmentTemplates()->where('template_name', $request->input('template_name'))->first();
        $template = json_decode($template->environment_structure, true);
        $rdsPasswords = new Collection();
        Log::info('Template:', ['template' => $template]);
        //$template = json_decode($template, true);  // The second argument makes it return an associative array
        if (!$template) {
            return response()->json(['error' => 'environment_structure is required'], 400);
        }

        $ec2Client = new Ec2Client([
            'version' => 'latest',
            'region'  => $this->region,
            'credentials' => [
                'key'    => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token'  => $this->credentials['SessionToken']
            ]
        ]);

        try {
        // Create VPC
            $vpc = $ec2Client->createVpc(['CidrBlock' => $template['VPC']['IP']]);
            $vpcId = $vpc['Vpc']['VpcId'];

        // Tag VPC if name provided
            if (isset($template['VPC']['name']) && $template['VPC']['name']) {
                $ec2Client->createTags([
                    'Resources' => [$vpcId],
                    'Tags' => [['Key' => 'Name', 'Value' => $template['VPC']['name']]],
                ]);
            }

        // Check for Internet Gateway
            $internetGatewayId = null;
            if ($template['VPC']['IGW']) {
                $igwResult = $ec2Client->createInternetGateway();
                $internetGatewayId = $igwResult['InternetGateway']['InternetGatewayId'];
                $ec2Client->attachInternetGateway(['InternetGatewayId' => $internetGatewayId, 'VpcId' => $vpcId]);
            }

            foreach ($template['VPC']['availabilityZones'] as $az) {
                foreach ($az['subnets'] as $subnet) {
                // ... (rest of subnet creation code)
                     $subnetResult = $ec2Client->createSubnet([
                        'VpcId'     => $vpcId,
                        'CidrBlock' => $subnet['IP'],
                    ]);
                    $subnetId = $subnetResult['Subnet']['SubnetId'];
                    
                    if(isset($subnet['resources']) && $subnet['resources']) {
                        foreach($subnet['resources'] as $resource) {
                            if($resource['resource_type'] == "EC2") {
                                $describeImagesResult = $ec2Client->describeImages(['ImageIds' => [$resource['ami_id']]]);
                                $amiDetails = $describeImagesResult['Images'][0] ?? null;
                                $deviceName = null;
                                if ($amiDetails && isset($amiDetails['BlockDeviceMappings'][0]['DeviceName'])) {
                                    $deviceName = $amiDetails['BlockDeviceMappings'][0]['DeviceName'];        
                                }
                                $ec2InstanceConfig = [
                                    'ImageId'        => $resource['ami_id'],
                                    'InstanceType'   => $resource['instance_type'],
                                    'subnetId'       => $subnetId,
                                    'SecurityGroupIds' => $resource['security_group_ids'],
                                    'EbsOptimized'   => $resource['ebs_optimized'],
                                    'MaxCount'       => 1,
                                    'MinCount'       => 1,
                                    'BlockDeviceMappings' => [
                                        [
                                            'DeviceName' => $deviceName,
                                            'Ebs' => [
                                            'VolumeSize' => $resource['volume_size'],
                                            'VolumeType' => $resource['volume_type'],
                                            'DeleteOnTermination' => $resource['delete_on_termination']
                                            ],
                                        ],
                                    ],
                                ];
                                $ec2InstanceResult = $ec2Client->runInstances($ec2InstanceConfig);
                            } else if($resource['resource_type'] == "RDS") {
                                
                                if($resource['master_user_password'] == "auto") {
                                    $resource['master_user_password'] = $this->generateRandomPassword();
                                    $rdsObject = new \stdClass();
                                    $rdsObject->name = $resource['template_name'];
                                    $rdsObject->password = $resource['master_user_password'];
                                    $rdsPasswords->push($rdsObject);
                                }

                                $rdsInstanceConfig = [
                                    'subnetId'             => $subnetId,
                                    'DBInstanceIdentifier' => $resource['template_name'],
                                    'AllocatedStorage'     => $resource['allocated_storage'],
                                    'DBInstanceClass'      => $resource['instance_type'],
                                    'Engine'               => $resource['engine'],
                                    'MasterUsername'       => $resource['master_username'],
                                    'MasterUserPassword'   => $resource['master_user_password'],
                                    'VpcSecurityGroupIds'  => $resource['security_group_ids'],
                                    'StorageType'          => $resource['storage_type'],
                                    'EngineVersion'        => $resource['engine_version'],
                                    'LicenseModel'         => $resource['license'],
                                    'StorageEncrypted'     => $resource['storage_encrypted'] ? true : false,
                                    'PerformanceInsightsEnabled' => $resource['performance_insights'],
                                ];
                                $rdsClient = new RdsClient([
                                    'region'  => $this->region,
                                    'version' => 'latest',
                                    'credentials' => [
                                        'key'    => $this->credentials['AccessKeyId'],
                                        'secret' => $this->credentials['SecretAccessKey'],
                                        'token'  => $this->credentials['SessionToken']
                                    ]
                                ]);
                                $rdsInstanceResult = $rdsClient->createDBInstance($rdsInstanceConfig);
                            } else if($resource['resource_type'] == "NAT") {
                                $eipResult = $ec2Client->allocateAddress([
                                    'Domain' => 'vpc'
                                ]);

                                $natGatewayConfig = [
                                    'SubnetId' => $subnetId, // You need to get the subnet ID
                                    'AllocationId' => $eipResult['AllocationId'], // The Elastic IP allocation ID
                                ];
                                $natGatewayResult = $ec2Client->createNatGateway($natGatewayConfig);
                            }
                        }
                    }

                    if (isset($subnet['routeTable']) && $subnet['routeTable']) {
                        $routeTableResult = $ec2Client->createRouteTable(['VpcId' => $vpcId]);
                        $routeTableId = $routeTableResult['RouteTable']['RouteTableId'];

                    // Add routes to route table based on 'entries'
                        foreach ($subnet['routeTable']['entries'] as $entry) {
                            $routeConfig = [
                                'DestinationCidrBlock' => $entry['destination'],
                                'RouteTableId'         => $routeTableId,
                            ];

                            // If target includes "igw", set the destination to 0.0.0.0/0 and target to the IGW ID
                            if (strtolower($entry['target']) === 'igw' && $internetGatewayId) {
                                $routeConfig['DestinationCidrBlock'] = '0.0.0.0/0';
                                $routeConfig['GatewayId'] = $internetGatewayId;
                            } else {
                                switch (strtolower($entry['target'])) {
                                    case 'nat':
                                    $routeConfig['NatGatewayId'] = $yourNatGatewayId;
                                    break;
                                default:
                                    Log::error('Unrecognized target: ' . $entry['target']);
                                    continue 2;  // Skip this iteration and move to the next entry
                                }
                            }

                            $ec2Client->createRoute($routeConfig);
                        }

                        // ... (rest of route table association code)
                    }
                }
            }
            
            if (count($rdsPasswords) > 0) {
                return $this->generateTxtFile($rdsPasswords);
            }
            return response()->json(['message' => 'environment structure created successfully']);
        } catch (\Aws\Exception\AwsException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getInstanceData(Request $request)
    {
        $instanceId = $request->query('instanceId');
        if(!$instanceId) {
            return response()->json(['error' => 'instanceID not found']);
        }
        $endTime = new DateTime(); // Now
        $startTime = clone $endTime;
        $startTime->sub(new DateInterval('P7D'));
        $startTimeStr = $startTime->format(DateTime::ATOM); // e.g., "2023-01-01T00:00:00+00:00"
        $endTimeStr = $endTime->format(DateTime::ATOM);

        try {
            $cloudWatch = new CloudWatchClient([
                'region' => $this->region,
                'version' => 'latest',
                'credentials' => [
                    'key'    => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token'  => $this->credentials['SessionToken']
                ]
                // Add your AWS credentials here if they're not set in your environment
            ]);
            $result = $cloudWatch->getMetricData([
                'MetricDataQueries' => [
                    [
                        'Id' => 'cpuUtilization',
                        'MetricStat' => [
                            'Metric' => [
                                'Namespace' => 'AWS/EC2',
                                'MetricName' => 'CPUUtilization',
                                'Dimensions' => [
                                    [
                                        'Name' => 'InstanceId',
                                        'Value' => $instanceId
                                    ],
                                ],
                            ],
                            'Period' => 300,  // 5 minutes
                            'Stat' => 'Average',
                        ],
                        'ReturnData' => true,
                    ],
                ],
                'StartTime' => $startTime,
                'EndTime' => $endTime,
            ]);

            return response()->json($result->toArray());

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getAppStreamData(Request $request)
    {
        $fleetName = $request->query('fleetName');
        if(!$fleetName) {
            return response()->json(['error' => 'fleetName not found']);
        }
        $endTime = new DateTime(); // Now
        $startTime = clone $endTime;
        $startTime->sub(new DateInterval('P7D'));
        $startTimeStr = $startTime->format(DateTime::ATOM); // e.g., "2023-01-01T00:00:00+00:00"
        $endTimeStr = $endTime->format(DateTime::ATOM);

        // Modify this method to fetch the relevant AppStream metrics. 
        // I've made a guess based on your prior code but you might need other metrics or dimensions.

        try {
            $cloudWatch = new CloudWatchClient([
                'region' => $this->region,
                'version' => 'latest',
                'credentials' => [
                    'key'    => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token'  => $this->credentials['SessionToken']
                ]
                // Add your AWS credentials here if they're not set in your environment
            ]);
            $result = $cloudWatch->getMetricData([
                'MetricDataQueries' => [
                    [
                        'Id' => 'actualCapacity',
                        'MetricStat' => [
                            'Metric' => [
                                'Namespace' => 'AWS/AppStream',
                                'MetricName' => 'Actual Capacity',
                                'Dimensions' => [
                                    [
                                        'Name' => 'FleetName',
                                        'Value' => $fleetName
                                    ],
                                ],
                            ],
                            'Period' => 300,  // 5 minutes
                            'Stat' => 'Average',
                        ],
                        'ReturnData' => true,
                    ],
                    [
                        'Id' => 'inUseCapacity',
                        'MetricStat' => [
                            'Metric' => [
                                'Namespace' => 'AWS/AppStream',
                                'MetricName' => 'In Use Capacity',
                                'Dimensions' => [
                                    [
                                        'Name' => 'FleetName',
                                        'Value' => $fleetName
                                    ],
                                ],
                            ],
                            'Period' => 300,  // 5 minutes
                            'Stat' => 'Average',
                        ],
                        'ReturnData' => true,
                    ],
                ],
                'StartTime' => $startTime,
                'EndTime' => $endTime,
            ]);

            return response()->json($result->toArray());

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getCostMetrics(Request $request)
    {
        $startTime = $request->query('startTime');
        $endTime = $request->query('endTime');

        if (!$startTime || !$endTime) {
            return response()->json(['error' => 'Both startTime and endTime are required'], 400);
        }

        try {
            $costExplorer = new CostExplorerClient([
                'version' => 'latest',
                'region' => $this->region,
                'credentials' => [
                    'key'    => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token'  => $this->credentials['SessionToken']
                ]
            // Add your AWS credentials here if they're not set in your environment
            ]);

            $result = $costExplorer->getCostAndUsage([
                'TimePeriod' => [
                    'Start' => $startTime,
                    'End' => $endTime
                ],
                'Granularity' => 'DAILY',  // Can be DAILY, MONTHLY, or HOURLY
                'Metrics' => ['UnblendedCost'],  // Adjust metrics as needed. Example: 'BlendedCost', 'UsageQuantity', etc.
                'GroupBy' => [  // Optional grouping
                    [
                        'Type' => 'DIMENSION',
                        'Key' => 'SERVICE'
                    ]
                ]
            ]);

            return response()->json($result->toArray());

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function scanAwsResources(Request $request)
    {
        $queryParams = $request->query();

        try {
            if(!empty($queryParams)) {
                if($request->has('EC2')) {
                    $ec2Client = new Ec2Client([
                        'region'  => $this->region,
                        'version' => 'latest',
                        'credentials' => [
                            'key'    => $this->credentials['AccessKeyId'],
                            'secret' => $this->credentials['SecretAccessKey'],
                            'token'  => $this->credentials['SessionToken']
                        ]
                    ]);

            // Fetch EC2 instances
                    return response()->json(["EC2_instances" => $ec2Client->describeInstances()->toArray()]);
                }

                if($request->has('RDS')) {
                    $rdsClient = new RdsClient([
                        'region'  => $this->region,
                        'version' => 'latest',
                        'credentials' => [
                            'key'    => $this->credentials['AccessKeyId'],
                            'secret' => $this->credentials['SecretAccessKey'],
                            'token'  => $this->credentials['SessionToken']
                        ]
                    ]);

                    return response()->json(["RDS_instances" => $rdsClient->describeDBInstances()->toArray()]);
                }

            } else {
                $ec2Client = new Ec2Client([
                    'region'  => $this->region,
                    'version' => 'latest',
                    'credentials' => [
                        'key'    => $this->credentials['AccessKeyId'],
                        'secret' => $this->credentials['SecretAccessKey'],
                        'token'  => $this->credentials['SessionToken']
                    ]
                ]);

                // Fetch EC2 instances
                $ec2Instances = $ec2Client->describeInstances()->toArray();

                // RDS Client setup
                $rdsClient = new RdsClient([
                    'region'  => $this->region,
                    'version' => 'latest',
                    'credentials' => [
                        'key'    => $this->credentials['AccessKeyId'],
                        'secret' => $this->credentials['SecretAccessKey'],
                        'token'  => $this->credentials['SessionToken']
                    ]
                ]);

        // Fetch RDS instances
                $rdsInstances = $rdsClient->describeDBInstances()->toArray();

        // You can add more clients and fetch calls for other services like Elastic Load Balancing, S3, etc.

        // Compile all results
                $allResources = [
                    'ec2Instances' => $ec2Instances,
                    'rdsInstances' => $rdsInstances,
            // Add other resources here
                ];

                return response()->json($allResources);
            }
        // EC2 Client setup
           

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getResourceMetrics(Request $request)
    {
    // Validation
        $request->validate([
            'resourceType' => 'required|string',
            'resourceId' => 'required|string',
            'metric' => 'required|string'
        ]);
        
    // AWS CloudWatch client initialization
        $client = new CloudWatchClient([
            'version' => 'latest',
            'region'  => env('AWS_DEFAULT_REGION'),
        ]);

    // Determine namespace and dimensions based on resource type
        $namespace = $this->getNamespace($request->resourceType);
        $dimensions = $this->getDimensions($request->resourceType, $request->resourceId);

    // Fetch metrics
        try {
            $result = $client->getMetricData([
                'MetricDataQueries' => [
                    [
                        'Id' => 'm1',  // Unique id for the metric data query
                        'MetricStat' => [
                            'Metric' => [
                                'Namespace' => $namespace,
                                'MetricName' => $request->metric,
                                'Dimensions' => $dimensions,
                            ],
                            'Period' => 300,   // In seconds
                            'Stat' => 'Average',
                        ],
                        'ReturnData' => true,
                    ],
                ],
                'StartTime' => now()->subHours(1)->toIso8601String(),
                'EndTime' => now()->toIso8601String(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $result['MetricDataResults'] ?? [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function getNamespace($resourceType)
    {
        $namespaces = [
            'EC2' => 'AWS/EC2',
            'RDS' => 'AWS/RDS',
        // Add other resource types and their corresponding namespaces
        ];

        return $namespaces[$resourceType] ?? 'Unknown';
    }

    private function getDimensions($resourceType, $resourceId)
    {
        switch ($resourceType) {
            case 'EC2':
                return [['Name' => 'InstanceId', 'Value' => $resourceId]];
            case 'RDS':
                return [['Name' => 'DBInstanceIdentifier', 'Value' => $resourceId]];
            // Add other resource types and their corresponding dimensions
        }

        return [];
    }

    public function getCharts() {
        return response()->json(Graph::all());
    }

    public function addNewChart(Request $request) {
        $graph = new Graph([
            'resource_id' => $request->resourceId,
            'resource_type' => $request->resourceType,
            'metric' => $request->metric
        ]);
        $this->currentUser->Graphs()->save($graph);
    }

    public function deleteChart(Request $request) {
        $graph = Graph::where('id', $request->chartId)->first();

        if ($graph) {
            $graph->delete();
            return response()->json(['message' => 'Graph deleted successfully.'], 200);
        } else {
        // Graph not found
         return response()->json(['message' => 'Graph not found.'], 404);
        }
    }

    public function getAMIs() {
        try {
        // Initialize EC2 Client with the credentials obtained in constructor
            $ec2Client = new Ec2Client([
                'version' => 'latest',
                'region' => $this->region,
                'credentials' => [
                    'key' => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token' => $this->credentials['SessionToken']
                ]
            ]);

        // Describe Images
            $result = $ec2Client->describeImages([
                'Owners' => ['self', 'amazon'] // Specify owners or other filters as required
            ]);

        // Return the AMI list
            return response()->json($result['Images']);
        } catch (\Exception $e) {
            Log::error($e);
            return response()->json(['error' => 'Failed to retrieve AMIs: ' . $e->getMessage()], 500);
        }
    }

    public function getSecurityGroups()
    {
        // Initialize the EC2 client
        $ec2Client = new Ec2Client([
            'region' => env('AWS_DEFAULT_REGION'),
            'version' => 'latest'
        ]);

        try {
            // Retrieve the security group information
            $result = $ec2Client->describeSecurityGroups();

            // Extract the security groups from the result
            $securityGroups = $result['SecurityGroups'] ?? [];

            // Return the security groups as a JSON response
            return response()->json($securityGroups);

        } catch (\Aws\Exception\AwsException $e) {
            // Return an error response if something goes wrong
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getLicenseModels($engine, $engineVersion)
    {

        if (!$engine || !$engineVersion) {
            return response()->json(['error' => 'Engine and engine version must be specified.'], 400);
        }

        // Initialize the RDS client
        $rdsClient = new RdsClient([
            'version' => 'latest',
            'region'  => env('AWS_DEFAULT_REGION'),
            'credentials' => [
                'key'    => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token'  => $this->credentials['SessionToken'] // This is optional and used if temporary credentials are being used
            ],
        ]);

        try {
            // Fetch the orderable DB instance options
            $result = $rdsClient->describeOrderableDBInstanceOptions([
                'Engine' => $engine,
                'EngineVersion' => $engineVersion,
            ]);

            // Extract the unique license models
            $licenseModels = collect($result->get('OrderableDBInstanceOptions'))
                ->pluck('LicenseModel')
                ->unique()
                ->values()
                ->all();

            return response()->json(['engine' => $engine, 'licenseModels' => $licenseModels]);

        } catch (\Aws\Exception\AwsException $e) {
            return response()->json(['error' => $e->getMessage()], $e->getStatusCode());
        }
    }


    public function getEngineVersions(Request $request)
    {
        // Retrieve the 'engine' query parameter
        $engine = $request->query('engine');
        if (!$engine) {
            return response()->json(['error' => 'Engine type must be specified.'], 400);
        }

        // Create an RDS client
        $rdsClient = new RdsClient([
            'version' => 'latest',
            'region'  => env('AWS_DEFAULT_REGION'), // or your specific region
            'credentials' => [
                    'key' => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token' => $this->credentials['SessionToken']
                ]
        ]);

        try {
            // Describe DB Engine Versions
            $result = $rdsClient->describeDBEngineVersions([
                'Engine' => $engine,
            ]);


            $versions = [];

            foreach ($result['DBEngineVersions'] as $version) {
                $versions[] = $version['EngineVersion'];
            }

            return response()->json(['engine' => $engine, 'versions' => $versions]);

        } catch (\Aws\Exception\AwsException $e) {
            // Return the error message if something goes wrong
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getOrderableDBInstanceOptions(Request $request)
    {
        // Retrieve query parameters for engine, engine version, and license model
        $engine = $request->query('engine');
        $engineVersion = $request->query('version');

        if (!$engine || !$engineVersion) {
            return response()->json(['error' => 'Engine and engine version must be specified.'], 400);
        }

        // Create an RDS client
        $rdsClient = new RdsClient([
            'version' => 'latest',
            'region'  => env('AWS_DEFAULT_REGION'), // or your specific region
            'credentials' => [
                'key' => $this->credentials['AccessKeyId'],
                'secret' => $this->credentials['SecretAccessKey'],
                'token' => $this->credentials['SessionToken']
            ]
        ]);

        try {
            $result = $rdsClient->describeOrderableDBInstanceOptions([
                'Engine' => $engine,
                'EngineVersion' => $engineVersion,
            ]);

            // Extract the unique license models
            $licenseModels = collect($result->get('OrderableDBInstanceOptions'))
                ->pluck('LicenseModel')
                ->unique()
                ->values()
                ->all();


            $result = $rdsClient->describeOrderableDBInstanceOptions([
                'Engine' => $engine,
                'EngineVersion' => $engineVersion,
                'LicenseModel' => $licenseModels[0],
            ]);

            $resultArray = $result->toArray();
            Log::info(json_encode($resultArray, JSON_PRETTY_PRINT));

            $instanceOptions = [];
            foreach ($result['OrderableDBInstanceOptions'] as $option) {
                $instanceOptions[] = [
                    'DBInstanceClass' => $option['DBInstanceClass'],
                    'StorageType'     => $option['StorageType'],
                    'MinStorageSize'  => $option['MinStorageSize'],
                    'MaxStorageSize'  => $option['MaxStorageSize']
                    // You can add more fields here as needed
                ];
            }

            return response()->json(['engine' => $engine, 'instanceOptions' => $instanceOptions, 'license' => $licenseModels]);

        } catch (\Aws\Exception\AwsException $e) {
            // Return the error message if something goes wrong
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

     public function listIamRoles(Request $request)
    {
        try {

            $iamClient = new IamClient([
                'version' => 'latest',
                'region'  => 'us-west-2', // Change to the region you're working with
                'credentials' => [
                    'key' => $this->credentials['AccessKeyId'],
                    'secret' => $this->credentials['SecretAccessKey'],
                    'token' => $this->credentials['SessionToken']
                ]
            ]);

            // Call the AWS SDK to list IAM roles
            $result = $iamClient->listRoles();

            // Extract the roles information
            $roles = $result->get('Roles');

            // You can process $roles array to fit your requirements before returning

            return response()->json([
                'success' => true,
                'roles'   => $roles,
            ]);
        } catch (\Aws\Exception\AwsException $e) {
            // Catch and return any AWS errors
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    
}
