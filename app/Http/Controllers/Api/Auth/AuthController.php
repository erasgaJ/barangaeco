<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken($request->device_name)->plainTextToken;

        $relationship = $user->isResident() ? 'resident.barangay' : 'collector';

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user->load($relationship)),
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'resident',
        ]);

        $idImagePath = $request->file('id_image')->store('id-images', 'public');

        $user->resident()->create([
            'barangay_id' => $request->barangay_id,
            'full_name' => $request->full_name,
            'address' => $request->address,
            'contact_number' => $request->contact_number,
            'id_image' => $idImagePath,
            'verification_status' => 'pending',
        ]);

        $token = $user->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user->load('resident')),
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $relationship = $user->isResident() ? 'resident.barangay' : 'collector';

        return response()->json(
            new UserResource($user->load($relationship))
        );
    }
}
