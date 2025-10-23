<?php

namespace App\Http\Controllers;

use App\Models\Revenue;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RevenueController extends Controller
{
    public function index()
    {
        // Fetch revenues with deal info
        $revenues = Revenue::with('deal:id,title')
            ->orderBy('payment_date', 'desc')
            ->get();

        // Fetch deals for filter dropdown
        $deals = Deal::select('id', 'title')->get();

        return Inertia::render('admin/revenues', [
            'revenues' => $revenues,
            'deals' => $deals,
        ]);
    }
}
