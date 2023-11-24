<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TemplateHandler;
use App\Http\Controllers\LoginHandler; // Import the correct controller namespace
use App\Http\Controllers\UserHandler;
use App\Http\Controllers\StripeHandler;
use App\Http\Controllers\AwsHandler; // Import the correct controller namespace
use Laravel\Socialite\Facades\Socialite; // Import Socialite facade
use App\Models\User; // Import User model
use Illuminate\Support\Facades\Auth; // Import Auth facade
use App\Http\Middleware\JWTMiddleware;

// Routes for fleet templates
Route::middleware(['api-key'])->group(function () {
    Route::get('/testWithAuth', [TemplateHandler::class, 'test']);

    //routes for fleet templates
    Route::get('/getFleetTemplates', [TemplateHandler::class, 'indexFleets']);
    Route::get('/getFleetTemplate/{template_name}', [TemplateHandler::class, 'indexFleet']);
    Route::post('/makeFleetTemplate', [TemplateHandler::class, 'makeFleet']);
    Route::delete('/deleteFleetTemplate/{template_name}', [TemplateHandler::class, 'deleteFleet']);
    Route::put('/editFleetTemplate/{template_name}', [TemplateHandler::class, 'editFleet']);

    // Routes for cron templates
    Route::get('/getCronTemplates', [TemplateHandler::class, 'indexCrons']);
    Route::get('/getCronTemplate/{template_name}', [TemplateHandler::class, 'indexCron']);
    Route::post('/makeCronTemplate', [TemplateHandler::class, 'makeCron']);
    Route::delete('/deleteCronTemplate/{template_name}', [TemplateHandler::class, 'deleteCron']);
    Route::put('/editCronTemplate/{template_name}', [TemplateHandler::class, 'editCron']);
    
    //Routes for Environment templates
    Route::get('/getEnvironmentTemplates', [TemplateHandler::class, 'indexEnvironments']);
    Route::get('/getEnvironmentTemplate/{template_name}', [TemplateHandler::class, 'indexEnvironment']);
    Route::post('/makeEnvironmentTemplate', [TemplateHandler::class, 'makeEnvironment']);
    Route::delete('/deleteEnvironmentTemplate/{template_name}', [TemplateHandler::class, 'deleteEnvironment']);
    Route::put('/editEnvironmentTemplate/{template_name}', [TemplateHandler::class, 'editEnvironment']);

    //Routes for EC2 templates
    Route::get('/getEC2Templates', [TemplateHandler::class, 'indexEC2Templates']);
    Route::get('/getEC2Template/{template_name}', [TemplateHandler::class, 'indexEC2Templates']);
    Route::post('/makeEC2Template', [TemplateHandler::class, 'makeEC2Template']);
    Route::delete('/deleteEC2Template/{template_name}', [TemplateHandler::class, 'deleteEC2Template']);
    Route::put('/editEC2Template/{template_name}', [TemplateHandler::class, 'editEC2Template']);

    //Routes for RDS templates
    Route::get('/getRDSTemplates', [TemplateHandler::class, 'indexRDSTemplates']);
    Route::get('/getRDSTemplate/{template_name}', [TemplateHandler::class, 'indexRDSTemplates']);
    Route::post('/makeRDSTemplate', [TemplateHandler::class, 'makeRDSTemplate']);
    Route::delete('/deleteRDSTemplate/{template_name}', [TemplateHandler::class, 'deleteRDSTemplate']);
    Route::put('/editRDSTemplate/{template_name}', [TemplateHandler::class, 'editRDSTemplate']);


    //aws related
    Route::post('/updateAwsCredentials', [UserHandler::class, 'updateAwsCredentials']);
    Route::get('/aws/getAccounts', [AwsHandler::class, 'getAccounts']);
    Route::get('/aws/testConnection', [AwsHandler::class, 'testConstructor']);
    Route::get('/aws/indexFleets', [AwsHandler::class, 'indexFleets']);
    Route::post('/aws/makeFleet', [AwsHandler::class, 'makeFleet']);
    Route::post('/aws/startFleet', [AwsHandler::class, 'startFleet']);
    Route::post('/aws/stopFleet', [AwsHandler::class, 'stopFleet']);
    Route::post('/aws/deleteFleet', [AwsHandler::class, 'deleteFleet']);
    Route::get('/aws/describeImages', [AwsHandler::class, 'describeImages']);
    Route::post('/aws/createEnvironmentStructure', [AwsHandler::class, 'createEnvironmentStructure']);
    Route::get('/aws/getInstanceData', [AwsHandler::class, 'getInstanceData']);
    Route::get('/aws/getAppStreamData', [AwsHandler::class, 'getAppStreamData']);
    Route::get('/aws/getCostMetrics', [AwsHandler::class, 'getCostMetrics']);
    Route::get('/aws/getResourceData', [AwsHandler::class, 'scanAwsResources']);
    Route::post('/aws/getResourceMetrics', [AwsHandler::class, 'getResourceMetrics']);
    Route::get('/aws/getCharts', [AwsHandler::class, 'getCharts']);
    Route::post('/aws/addNewChart', [AwsHandler::class, 'addNewChart']);
    Route::post('/aws/deleteChart', [AwsHandler::class, 'deleteChart']);
    Route::get('/aws/getAMIs', [AwsHandler::class, 'getAMIs']);
    Route::get('/aws/getSecurityGroups', [AwsHandler::class, 'getSecurityGroups']);
    Route::get('/aws/getEngineVersions', [AwsHandler::class, 'getEngineVersions']);
    Route::get('/aws/getOrderableDBInstanceOptions', [AwsHandler::class, 'getOrderableDBInstanceOptions']);
    Route::get('/aws/listIamRoles', [AwsHandler::class, 'listIamRoles']);






    //routes for stripe
    Route::post('/deleteSubscription', [StripeHandler::class, 'deleteSubscription']);

    //routes for user
    Route::post('/changePassword', [UserHandler::class, 'changePassword']);
    Route::put('/rotateApiKey', [UserHandler::class, 'rotateApiKey']);
    Route::put('/updateName', [UserHandler::class, 'updateName']);
    Route::get('/getDefaultRegion', [UserHandler::class, 'getDefaultRegion']);
    Route::post('/setDefaultRegion', [UserHandler::class, 'setDefaultRegion']);
    Route::get('/getExternalID', [UserHandler::class, 'getExternalID']);



    //mfa
    Route::post('/enableMfa', [UserHandler::class, 'enableMFA']);
    Route::post('/validateMfa', [UserHandler::class, 'verifyInitialMFA']);
    Route::post('/toggleMFA', [UserHandler::class, 'toggleMFA']);

});

Route::post('/validateGoogleUser', [UserHandler::class, 'validateGoogleUser']);
Route::post('/getSubscriptionData', [StripeHandler::class, 'getSubscriptionData']);
Route::post('/getMFADetails', [UserHandler::class, 'getMFADetails']);
Route::post('/checkCoupon', [StripeHandler::class, 'isStripeCouponValid']);
Route::post('/stripe/createUser', [StripeHandler::class, 'createStripeUser']);
Route::post('/stripe/createSubscription', [StripeHandler::class, 'createSubscription']);
Route::post('/stripe/webhooks', [StripeHandler::class, 'handleWebhook']);//->middleware('verified.stripe.webhook');
Route::post('/payment-intent/create', [StripeHandler::class, 'createIntent']);
Route::post('/payment-intent/confirm', [StripeHandler::class, 'confirmIntent']);
Route::post('/validateForgotPassword', [UserHandler::class, 'forgotPasswordHandler']);
Route::post('/createUser', [UserHandler::class, 'create']);
Route::get('/getResetToken', [UserHandler::class, 'getResetToken']);

Route::post('/login', [UserHandler::class, 'login']);
Route::get('/test', [TemplateHandler::class, 'test']);





















