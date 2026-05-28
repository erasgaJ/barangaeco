<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('resident/announcements/index');
    }
}
