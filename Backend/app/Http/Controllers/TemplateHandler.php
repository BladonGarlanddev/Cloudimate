<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Fleet_template as Fleet;
use App\Models\Cron_template as Cron;
use App\Models\EC2;
use App\Models\RDS;
use App\Models\Environment;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;


class TemplateHandler extends Controller
{

    protected $currentUser;

    public function __construct(Request $request) {
        $email = $request->header('X-User-Email');

        $this->currentUser = User::where('email', $email)->first();
    }

    function test() {
        // Dummy data as an associative array
        $dummyData = [
            [
                'id' => 1,
                'name' => 'Dummy Template 1',
                'description' => 'This is the first dummy template.',
            ],
            [
                'id' => 2,
                'name' => 'Dummy Template 2',
                'description' => 'This is the second dummy template.',
            ],
            // Add more dummy data as needed
        ];
    
        // Convert the array to JSON format
        $jsonData = json_encode($dummyData);
    
        return $jsonData;
    }
    

    function indexCrons() {
        return response()->json($this->currentUser->cronTemplates);
    }

    function indexFleets() {
        return response()->json($this->currentUser->fleetTemplates);
    }

    public function indexEnvironments() {
        return response()->json($this->currentUser->environmentTemplates);
    }

    public function indexEC2Templates() {
        return response()->json($this->currentUser->EC2Templates);
    }

    public function indexRDSTemplates() {
        return response()->json($this->currentUser->RDSTemplates);
    }

    public function indexCron($template_name) {
        $cron = $this->currentUser->cronTemplates()->where('template_name', $template_name)->first();
        if(!$cron) {
            return response()->json(['error' => 'Cron Template not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json($cron);
    }

    public function indexFleet($template_name) {
        $fleet = $this->currentUser->fleetTemplates()->where('template_name', $template_name)->first();
        if(!$fleet) {
            return response()->json(['error' => 'Fleet Template not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json($fleet);
    }

    public function indexEnvironment($template_name) {
        $environment = $this->currentUser->environmentTemplates()->where('template_name', $template_name)->first();
        if(!$environment) {
            return response()->json(['error' => 'environment Template not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json($environment);
    }

    public function indexEC2Template($template_name) {
        $template = $this->currentUser->EC2Templates()->where('template_name', $template_name)->first();
        if(!$template) {
            return response()->json(['error' => 'EC2 Template not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json($template);
    }

    public function indexRDSTemplate($template_name) {
        $template = $this->currentUser->RDSTemplates()->where('template_name', $template_name)->first();
        if(!$template) {
            return response()->json(['error' => 'RDS Template not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json($template);
    }

    function makeFleet(Request $request) {
    if(!$this->currentUser->fleetTemplates()->where('template_name', $request->template_name)->first()) {
        $data = $request->all();
        // This line is not strictly necessary if you have set up the JSON cast in the model
        $data['scale_policy'] = json_encode($data['scale_policy']);
        
        $this->currentUser->fleetTemplates()->create($data);
        return response()->json(['created' => 'Successfully created.'], Response::HTTP_CREATED);
    }
        return response()->json(['error' => 'Name taken. Use a different name.'], Response::HTTP_CONFLICT);
    }


    function makeCron(Request $request) {
        $data = $request->json()->all();
        if(!$this->currentUser->cronTemplates()->where('template_name', $data['template_name'])->first()) {
            $this->currentUser->cronTemplates()->create($data);
            return response()->json(['success' => 'Successfully created.'], Response::HTTP_CREATED);
        }
        return response()->json(['error' => 'Name taken. Use a different name.'], Response::HTTP_CONFLICT);
    }

    public function makeEnvironment(Request $request) {
        $data = $request->json()->all();
        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json(['error' => json_last_error_msg()], 400);
        }
        $data['environment_structure'] = json_encode($data['environment_structure']);
        $existingTemplate = $this->currentUser->environmentTemplates()->where('template_name', $data['template_name'])->first();

        if($existingTemplate) {
            $existingTemplate->update($data);
            return response()->json(['success' => 'Successfully updated the environment template.'], Response::HTTP_OK);
        } 
    
        else {
            $this->currentUser->environmentTemplates()->create($data);
            return response()->json(['created' => 'Successfully created new environment template.'], Response::HTTP_CREATED);
        }
    }

    function makeEC2Template(Request $request) {
        $data = $request->json()->all();
        if(!$this->currentUser->EC2Templates()->where('template_name', $data['template_name'])->first()) {
            $this->currentUser->EC2Templates()->create($data);
            return response()->json(['success' => 'Successfully created.'], Response::HTTP_CREATED);
        }
        return response()->json(['error' => 'Name taken. Use a different name.'], Response::HTTP_CONFLICT);
    }

    function makeRDSTemplate(Request $request) {
        $data = $request->json()->all();
        if(!$this->currentUser->RDSTemplates()->where('template_name', $data['template_name'])->first()) {
            $this->currentUser->RDSTemplates()->create($data);
            return response()->json(['success' => 'Successfully created.'], Response::HTTP_CREATED);
        }
        return response()->json(['error' => 'Name taken. Use a different name.'], Response::HTTP_CONFLICT);
    }

    function deleteFleet($template_name) {
        if($this->indexFleet($template_name)) {
            $this->currentUser->fleetTemplates()->where('template_name', $template_name)->delete();
            return response()->json(['success' => 'Successfully deleted.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }

    function deleteCron($template_name) {
        if($this->indexCron($template_name)) {
            $this->currentUser->cronTemplates()->where('template_name', $template_name)->delete();
            return response()->json(['success' => 'Successfully deleted.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }

    public function deleteEnvironment($template_name) {
        $existingTemplate = $this->currentUser->environmentTemplates()->where('template_name', $template_name)->first();
        if($existingTemplate) {
            $existingTemplate->delete();
            return response()->json(['success' => 'Successfully deleted the environment template.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }

    public function deleteEC2Template($template_name) {
        $existingTemplate = $this->currentUser->EC2Templates()->where('template_name', $template_name)->first();
        if($existingTemplate) {
            $existingTemplate->delete();
            return response()->json(['success' => 'Successfully deleted the environment template.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }

    public function deleteRDSTemplate($template_name) {
        $existingTemplate = $this->currentUser->EC2Templates()->where('template_name', $template_name)->first();
        if($existingTemplate) {
            $existingTemplate->delete();
            return response()->json(['success' => 'Successfully deleted the environment template.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }

    function editCron(Request $request, $template_name) {
        if($this->indexCron($template_name)) {
            $data = $request->json()->all();
            $this->currentUser->cronTemplates()->where('template_name', $template_name)->update($data);
            return response()->json(['success' => 'Successfully updated.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }

    function editFleet(Request $request, $template_name) {
        if($this->indexFleet($template_name)) {
            $data = $request->json()->all();
            $this->currentUser->fleetTemplates()->where('template_name', $template_name)->update($data);
            return response()->json(['success' => 'Successfully updated.']);
        }
        return response()->json(['error' => 'Template does not exist'], Response::HTTP_NOT_FOUND);
    }
}
