<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Revenue;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DealController extends Controller
{
    public function index()
    {
        $deals = Deal::with(['client:id,name', 'createdBy:id,name'])
            ->get();

        $clients = User::select('id', 'name', 'role') // <-- include role
            ->where('role', '!=', 'admin')          // <-- filter out admins here
            ->get();

        $stages = ['lead', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

        return Inertia::render('admin/deals', [
            'deals' => $deals,
            'clients' => $clients,
            'stages' => $stages,
        ]);
    }

    public function setStage(Deal $deal, string $stage)
    {
        $deal->stage = $stage;
        $deal->save();

        // Automatically create revenue if deal is closed_won
        if ($stage === 'closed_won') {
            Revenue::create([
                'deal_id' => $deal->id,
                'amount' => $deal->value,
                'payment_date' => Carbon::now()->toDateString(),
            ]);
        }

        return redirect()->back()->with('success', "Deal stage set to {$stage}");
    }

    // Optional: convenience methods
    public function setLead(Deal $deal) { return $this->setStage($deal, 'lead'); }
    public function setProposal(Deal $deal) { return $this->setStage($deal, 'proposal'); }
    public function setNegotiation(Deal $deal) { return $this->setStage($deal, 'negotiation'); }
    public function setClosedWon(Deal $deal) { return $this->setStage($deal, 'closed_won'); }
    public function setClosedLost(Deal $deal) { return $this->setStage($deal, 'closed_lost'); }
}
