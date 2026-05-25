<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first()->id;

        $complaints = [
            [
                'barangay_id' => 1,
                'complaint_type' => 'Road',
                'complaint_against' => 'DPWH contractor',
                'description' => 'Ang daan sa Purok 3 ay puno ng malalim na butas at mapanganib sa mga motorsiklo. Ilang beses na nagkaroon ng aksidente dito lalo na sa gabi. Hinihiling ang agarang pag-aayos ng kalsada.',
                'priority' => 'high',
                'status' => 'open',
            ],
            [
                'barangay_id' => 1,
                'complaint_type' => 'Noise',
                'complaint_against' => 'Juan dela Cruz',
                'description' => 'Ang aming kapitbahay ay patuloy na nagpapatugtog ng malakas na musika mula alas-dose ng gabi hanggang alas-tres ng umaga. Nakakaistorbo sa tulog ng mga bata at matatanda sa aming pamilya.',
                'priority' => 'medium',
                'status' => 'in_progress',
            ],
            [
                'barangay_id' => 2,
                'complaint_type' => 'Environment',
                'complaint_against' => 'Kalapit na pabrika',
                'description' => 'May malakas na amoy na galing sa pabrika sa tabi ng aming barangay. Nakakaapekto ito sa kalusugan ng mga residente lalo na ang mga bata at matatanda. Maraming beses na naming inireklamo ngunit wala pang aksyon.',
                'priority' => 'high',
                'status' => 'open',
            ],
            [
                'barangay_id' => 2,
                'complaint_type' => 'Infrastructure',
                'complaint_against' => 'Lokal na pamahalaan',
                'description' => 'Ang ilaw sa aming sityo ay sira na ng mahigit dalawang buwan. Mapanganib para sa mga naglalakad at nagmamaneho sa gabi. Hinihiling ang agarang pagpapalit ng mga sirang ilaw sa Sityo Bagong Pag-asa.',
                'priority' => 'high',
                'status' => 'open',
            ],
            [
                'barangay_id' => 3,
                'complaint_type' => 'Other',
                'complaint_against' => 'Mga hindi kilalang indibidwal',
                'description' => 'Mayroong grupo ng mga kabataan na nagiging maingay at nakakaistorbo sa aming komunidad tuwing gabi. Minsan ay may mga nagaganap na basagan at away. Nag-aalala ang mga magulang para sa kaligtasan ng kanilang mga anak.',
                'priority' => 'medium',
                'status' => 'open',
            ],
            [
                'barangay_id' => 3,
                'complaint_type' => 'Road',
                'complaint_against' => 'Barangay tanggapan',
                'description' => 'Ang drainage system sa aming lugar ay hindi gumagana. Sa tuwing umuulan, ang aming bakuran at kalye ay nagbabaha. Maraming pag-aari ang nasira dahil dito. Kailangan na agad na ayusin ang drainage.',
                'priority' => 'high',
                'status' => 'resolved',
            ],
            [
                'barangay_id' => 4,
                'complaint_type' => 'Noise',
                'complaint_against' => 'Videoke bar sa kanto',
                'description' => 'Ang videoke bar sa kanto ng Rizal at Bonifacio Street ay bukas hanggang alas-dos ng umaga. Nagsisimula pa ito ng hapon at nagdudulot ng malaking abala sa aming komunidad. Hinihiling ang pagpapatupad ng curfew para sa ingay.',
                'priority' => 'medium',
                'status' => 'in_progress',
            ],
            [
                'barangay_id' => 4,
                'complaint_type' => 'Environment',
                'complaint_against' => 'Kapitbahay na nagsusunog ng basura',
                'description' => 'Ang aming kapitbahay ay madalas na nagsusunog ng basura sa kanilang bakuran. Ang usok ay pumapasok sa aming bahay at nagdudulot ng problema sa paghinga ng aming mga miyembro ng pamilya na may asthma.',
                'priority' => 'medium',
                'status' => 'open',
            ],
            [
                'barangay_id' => 5,
                'complaint_type' => 'Infrastructure',
                'complaint_against' => 'Water district',
                'description' => 'Walang tubig sa aming lugar sa loob ng tatlong araw. Nasira ang main pipe sa aming sityo at hindi pa naaayos. Mahirap para sa aming pamilya lalo na ang pagluluto at kalinisan. Hinihiling ang agarang pagkukumpuni.',
                'priority' => 'high',
                'status' => 'open',
            ],
            [
                'barangay_id' => 5,
                'complaint_type' => 'Road',
                'complaint_against' => 'Konstruksyon ng kalapit na gusali',
                'description' => 'Ang mga trak ng konstruksyon ng bagong gusali ay umaalis ng alas-cinco ng umaga at nakakasagabal sa trapiko. Maraming pinsala ang nagawa sa mga kalsada at walang tumutupad sa mga reklamo ng mga residente.',
                'priority' => 'high',
                'status' => 'open',
            ],
            [
                'barangay_id' => 1,
                'complaint_type' => 'Other',
                'complaint_against' => 'Hindi kilalang hayop na may-ari',
                'description' => 'Mayroong mga aso sa aming sityo na hindi nakatali at palaging nagagalit. Ilang bata na ang nakagat at nagkaroon ng pinsala. Kailangan na magsagawa ng aksyon para sa kaligtasan ng lahat ng residente lalo na ang mga bata.',
                'priority' => 'high',
                'status' => 'in_progress',
            ],
            [
                'barangay_id' => 6,
                'complaint_type' => 'Noise',
                'complaint_against' => 'Construction site',
                'description' => 'Ang konstruksyon sa tabi ng aming barangay ay nagtatrabaho kahit Linggo at pista opisyal. Nagsisimula pa ito ng alas-cinco ng umaga at nagdudulot ng malaking abala. Hinihiling ang paggalang sa pahinga ng mga residente.',
                'priority' => 'low',
                'status' => 'resolved',
            ],
        ];

        foreach ($complaints as $data) {
            $data['created_by'] = $admin;
            Complaint::create($data);
        }
    }
}
