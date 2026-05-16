<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResidentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'address' => $this->address,
            'contact_number' => $this->contact_number,
            'id_image' => $this->id_image,
            'verification_status' => $this->verification_status,
            'barangay_id' => $this->barangay_id,
            'barangay' => $this->whenLoaded('barangay'),
        ];
    }
}
