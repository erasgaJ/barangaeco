<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('resident/document-requests/index');
    }

    public function store(): RedirectResponse
    {
        return back();
    }

    public function cancel(): RedirectResponse
    {
        return back();
    }
}
