<?php

namespace App\Support;

use Illuminate\Support\Arr;

class PhilippineData
{
    public static function firstNamesMale(): array
    {
        return [
            'Juan', 'Jose', 'Ramon', 'Eduardo', 'Rodrigo', 'Danilo', 'Roberto', 'Carlos', 'Manuel', 'Fernando',
            'Ernesto', 'Alberto', 'Ricardo', 'Antonio', 'Miguel', 'Angelo', 'Mark', 'John', 'Ryan', 'Christian',
            'Francis', 'Joel', 'Mario', 'Renato', 'Efren', 'Rolando', 'Dominador', 'Leonardo', 'Vicente', 'Gregorio',
            'Felipe', 'Bonifacio', 'Emilio', 'Apolinario', 'Melchior', 'Mariano', 'Pascual', 'Tomas', 'Severino', 'Lope',
        ];
    }

    public static function firstNamesFemale(): array
    {
        return [
            'Maria', 'Ana', 'Rosario', 'Lourdes', 'Carmen', 'Teresita', 'Luzviminda', 'Maricel', 'Jennifer', 'Grace',
            'Cristina', 'Marilou', 'Elaine', 'Patricia', 'Rowena', 'Imelda', 'Corazon', 'Gloria', 'Evangeline', 'Fe',
            'Esperanza', 'Paz', 'Amelia', 'Cecilia', 'Josefina', 'Leonora', 'Mercedes', 'Perla', 'Remedios', 'Socorro',
            'Victoria', 'Zenaida', 'Aurora', 'Belinda', 'Consuelo', 'Delfina', 'Estrella', 'Felicitas', 'Gemma', 'Hilda',
        ];
    }

    public static function lastNames(): array
    {
        return [
            'Santos', 'Reyes', 'Cruz', 'Garcia', 'Torres', 'Aquino', 'Dela Cruz', 'Bautista', 'Villanueva', 'Hernandez',
            'Ramos', 'Flores', 'Pascual', 'Domingo', 'Ocampo', 'Mendoza', 'Castillo', 'Padilla', 'Guzman', 'Soriano',
            'Santiago', 'Lopez', 'Agoncillo', 'Arellano', 'Bernardo', 'Cabrera', 'Del Rosario', 'Esteban', 'Ferrer', 'Gonzales',
            'Ignacio', 'Jimenez', 'Kalaw', 'Laxamana', 'Magpayo', 'Navarro', 'Ortega', 'Panganiban', 'Quizon', 'Recto',
            'Salazar', 'Tolentino', 'Umali', 'Valdez', 'Wenceslao', 'Yabut', 'Zabala', 'Abad', 'Belmonte', 'Corpuz',
        ];
    }

    public static function randomFullName(): string
    {
        $gender = rand(0, 1) ? 'male' : 'female';
        $firstName = $gender === 'male' ? Arr::random(static::firstNamesMale()) : Arr::random(static::firstNamesFemale());
        $lastName = Arr::random(static::lastNames());

        return "{$firstName} {$lastName}";
    }

    public static function mobileNumber(): string
    {
        // Format: +639XXXXXXXXX (13 characters)
        return '+639'.str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
    }

    public static function streetNames(): array
    {
        return [
            'Rizal', 'Bonifacio', 'Mabini', 'Aguinaldo', 'Quezon', 'Gregorio', 'Magsaysay', 'Lapu-Lapu', 'Tandang Sora', 'Sampaguita',
            'Luna', 'Del Pilar', 'Jacinto', 'Silang', 'Dagohoy', 'Malvar', 'Escoda', 'Tecson', 'Agoncillo', 'Basa',
        ];
    }

    public static function address(): array|string
    {
        $block = rand(1, 50);
        $lot = rand(1, 100);
        $street = Arr::random(static::streetNames());
        $purok = rand(1, 7);

        return "Block {$block}, Lot {$lot}, {$street} Street, Purok {$purok}";
    }

    public static function complaintDescriptions(): array
    {
        return [
            'Maingay ang videoke sa tapat ng aming bahay kahit lampas na ng alas-diyes ng gabi.',
            'Hindi nakolekta ang basura sa aming kalye simula pa noong nakaraang linggo.',
            'May baradong kanal sa kanto na nagdudulot ng baha tuwing umuulan.',
            'Maraming ligaw na aso sa paligid na nananakot sa mga bata.',
            'May mga kabataang nag-iinuman sa kalsada at gumagawa ng gulo.',
            'Sira ang bumbilya ng poste ng ilaw sa aming kalsada, napakadilim sa gabi.',
            'May nagtatapon ng basura sa bakanteng lote sa likod ng aming bahay.',
            'Masyadong mabilis magpatakbo ng motor ang mga rider sa aming eskinita.',
            'Nag-aaway ang magkapitbahay dahil sa boundary ng kanilang lupa.',
            'May tumatagas na tubig mula sa tubo ng Maynilad/Manila Water sa harap ng aming gate.',
            'Hindi maayos ang pagkakalagay ng mga kable ng kuryente, nakalaylay na sa daan.',
            'May amoy ng patay na hayop na nanggagaling sa kanal malapit sa amin.',
            'Maraming tambay sa tapat ng tindahan na nambabastos ng mga dumadaan.',
            'Nagpapatakbo ng negosyo na maingay sa gabi kahit residential zone ito.',
            'May nag-iwan ng sirang sasakyan sa gitna ng daan, nakaharang sa trapiko.',
            'Bumabaha sa aming lugar kahit mahina lang ang ulan dahil sa baradong drainage.',
            'May sunog na basura na nagdudulot ng makapal na usok at masamang amoy.',
            'Maingay na konstruksyon kahit madaling araw na.',
            'Illegal parking ng mga sasakyan sa makitid na kalsada.',
            'Hindi maayos na pagtatapon ng dumi ng alagang hayop ng kapitbahay.',
            'May mga batang naglalaro ng apoy sa bakanteng lote.',
            'Nagkakalat ng maling balita o tsismis ang ilang residente na nagdudulot ng gulo.',
            'Mabagal na aksyon ng barangay sa naunang inireport na problema.',
            'May nakitang kahina-hinalang tao na umaaligid sa aming lugar.',
            'Naglalaba sa gitna ng kalsada at nagtatapon ng maduming tubig sa daanan.',
        ];
    }

    public static function complaintAgainst(): array
    {
        return [
            'DPWH kontratista', 'Kapitbahay ni G. Santos', 'Water district', 'Barangay tanggapan',
            'Meralco technician', 'May-ari ng tindahan', 'Tricycle driver association',
            'Mga tambay sa kanto', 'Nagpapatakbo ng junk shop', 'Kontratista ng kalsada',
            'Gng. Dela Cruz', 'G. Rodriguez', 'Management ng subdivision', 'Operator ng perya',
            'May-ari ng maingay na aso', 'Nag-iinuman sa kalye', 'Nagtitinda sa bangketa',
            'Basurero ng munisipyo', 'Security guard ng gate', 'Mga kabataang naglalaro sa daan',
        ];
    }

    public static function documentPurposes(): array
    {
        return [
            'Para sa aplikasyon ng trabaho', 'Para sa scholarship application', 'Para sa pagbubukas ng bank account',
            'Para sa requirement sa paaralan', 'Para sa pagkuha ng pasaporte', 'Para sa postal ID application',
            'Para sa loan application', 'Para sa NBI clearance requirement', 'Para sa paglilipat ng tirahan',
            'Para sa patunay ng paninirahan', 'Para sa kuryente/tubig connection', 'Para sa kasal',
            'Para sa legal na dokumento', 'Para sa pagkuha ng pensyon', 'Para sa ayuda mula sa gobyerno',
        ];
    }

    public static function documentReasons(): array
    {
        return [
            'Kailangan ko ng patunay na ako ay lehitimong residente dito.',
            'Isa itong mahalagang requirement para sa aking bagong trabaho.',
            'Gagamitin ko ito para sa aking scholarship sa kolehiyo.',
            'Bilang suporta sa aking aplikasyon para sa tulong pinansyal.',
            'Kinakailangan para sa pagproseso ng aking mga legal na papel.',
            'Para sa pag-update ng aking mga record sa SSS/GSIS.',
            'Gagamitin para sa pag-apply ng business permit.',
            'Requirement para sa pagkuha ng voter\'s registration.',
            'Para sa pagpapatunay ng aking magandang asal sa komunidad.',
            'Bilang suporta sa aking aplikasyon para sa pabahay.',
            'Kailangan para sa pagkuha ng lisensya.',
            'Para sa pag-claim ng insurance.',
            'Gagamitin para sa pag-apply ng travel document.',
            'Requirement para sa pag-enrol sa paaralan.',
            'Para sa pagpapatunay ng aking katayuan bilang indigent.',
        ];
    }

    public static function announcementTitles(): array
    {
        return [
            'Abiso: Pagkolekta ng Basura sa Linggo', 'Barangay Fiesta 2026', 'Libreng Bakuna para sa mga Bata',
            'General Assembly ng mga Residente', 'Clean-up Drive sa Sabado', 'Medical Mission sa Barangay Hall',
            'Paalala tungkol sa Curfew', 'Zumba Session tuwing Hapon', 'Libreng Seminar para sa Pangkabuhayan',
            'Abiso: Pansamantalang Walang Tubig', 'Pagpaparehistro para sa Ayuda', 'Buntis Congress 2026',
            'Paalala sa Tamang Pagtatapon ng Basura', 'Oplan Bakuna kontra Polio', 'Barangay Night Celebration',
            'Seminar tungkol sa Disaster Preparedness', 'Libreng Gupit para sa mga Estudyante',
            'Abiso: Road Repair sa Rizal Street', 'Distribution ng Senior Citizen Allowance',
            'Paalala: Iwas Sunog sa Tag-init', 'Feeding Program para sa mga Bata',
            'Libreng Legal Consultation', 'Mobile Passporting Service',
            'Abiso: Pagbabago sa Waste Collection Schedule', 'Anti-Rabies Vaccination Drive',
        ];
    }

    public static function announcementMessages(): array
    {
        return [
            'Ipinapaalam sa lahat na magkakaroon ng special waste collection sa darating na Linggo, alas-otso ng umaga. Paki-handa ang inyong mga segregeted na basura.',
            'Halina at makisaya sa ating darating na Barangay Fiesta! Maraming handog na palaro at saya para sa bawat pamilya. Magkita-kita tayo sa plasa.',
            'Magkakaroon ng libreng bakuna para sa mga batang edad 0 hanggang 5 taon sa darating na Martes. Dalhin ang inyong baby record card sa barangay health center.',
            'Inaanyayahan ang lahat ng mga pinuno ng pamilya na dumalo sa ating General Assembly sa Sabado, alas-nuwebe ng umaga sa barangay covered court.',
            'Makiisa sa ating Clean-up Drive sa darating na Sabado. Sama-sama nating linisin ang ating mga kanal at paligid para sa kaligtasan ng lahat.',
            'Magkakaroon ng Medical Mission sa barangay hall sa Lunes. May libreng check-up at gamot para sa mga nangangailangan. Mag-palista na po.',
            'Mahigpit na ipinapaalala ang pagsunod sa curfew hours simula alas-diyes ng gabi hanggang alas-kwatro ng madaling araw. Maraming salamat sa kooperasyon.',
            'Sumali sa ating Zumba Session tuwing alas-singko ng hapon sa barangay plaza. Maging malusog at malakas ang pangangatawan!',
            'Libreng seminar para sa mga nais magkaroon ng sariling maliit na negosyo. Gaganapin ito sa Miyerkules sa barangay session hall.',
            'Magkakaroon ng pansamantalang pagkawala ng suplay ng tubig mula alas-otso ng gabi hanggang alas-kwatro ng madaling araw dahil sa repair ng main pipe.',
            'Magsisimula na ang pagpaparehistro para sa susunod na batch ng ayuda. Dalhin ang inyong valid ID at patunay ng paninirahan sa barangay hall.',
            'Inaanyayahan ang lahat ng mga nagbubuntis sa ating Buntis Congress. Magkakaroon ng libreng ultrasound at bitamina para sa inyo.',
            'Paalala sa lahat na sundin ang tamang pagbubukod ng basura (biodegradable at non-biodegradable). Ang hindi susunod ay maaaring pagmultahin.',
            'Ang ating barangay ay makikilahok sa Oplan Bakuna kontra Polio. Magbabahay-bahay ang ating mga health workers para sa mga bata.',
            'Isang gabi ng awitan at sayawan para sa lahat! Halina sa ating Barangay Night Celebration sa covered court sa Biyernes ng gabi.',
            'Mahalagang dumalo sa ating seminar tungkol sa Disaster Preparedness upang maging handa sa anumang sakuna gaya ng lindol o baha.',
            'Libreng gupit para sa lahat ng mga estudyante bago ang pasukan. Pumunta lamang sa barangay hall sa darating na Linggo.',
            'Magkakaroon ng road repair sa kahabaan ng Rizal Street simula sa Lunes. Inaasahan ang bahagyang pagbagal ng trapiko sa nasabing lugar.',
            'Magsisimula na ang distribution ng allowance para sa ating mga Senior Citizens sa darating na Huwebes. Dalhin ang inyong OSCA ID.',
            'Ngayong panahon ng tag-init, maging maingat tayo sa paggamit ng kuryente at pagluluto upang makaiwas sa panganib ng sunog.',
            'Makiisa sa ating lingguhang feeding program para sa mga bata sa ating komunidad. Gaganapin ito tuwing Sabado ng tanghali.',
            'Magkakaroon ng libreng legal consultation sa barangay hall sa darating na Biyernes. Mag-palista po sa ating secretary.',
            'Ang Department of Foreign Affairs ay magkakaroon ng Mobile Passporting Service sa ating barangay sa susunod na buwan. Mag-pre-register na.',
            'Pansamantalang babaguhin ang waste collection schedule dahil sa maintenance ng ating mga garbage truck. Ang bagong schedule ay ilalathala bukas.',
            'Protektahan ang ating mga alaga at ang komunidad. Magkakaroon ng libreng anti-rabies vaccination drive para sa mga aso at pusa sa Sabado.',
        ];
    }

    public static function collectionNotes(): array
    {
        return [
            'Natapos ang koleksyon ng basura sa Zone 2.',
            'Kasalukuyang nagkokolekta sa kahabaan ng Rizal Street.',
            'Naantala ang koleksyon dahil sa lakas ng ulan.',
            'Nakolekta na ang lahat ng basura sa itinakdang mga kanto.',
            'Maraming basura ang hindi naka-segregate ng maayos sa Zone 4.',
            'Nasira ang truck pero nagpatuloy gamit ang alternatibong sasakyan.',
            'Maayos na natapos ang koleksyon sa lahat ng nakatakdang lugar.',
            'Naging mabilis ang koleksyon dahil sa tulong ng mga residente.',
            'May ilang kalsada na hindi mapasok dahil sa mga nakaparadang sasakyan.',
            'Natapos ang koleksyon ng mas maaga sa inaasahan.',
            'Kailangang bumalik bukas para sa mga hindi nakuhang basura sa dulo ng Zone 5.',
            'Naging matagumpay ang koleksyon ng mga recyclable materials.',
            'Maayos na na-turnover ang mga basura sa central collection point.',
            'May nakitang illegal dumpsite sa likod ng covered court, kailangang linisin.',
            'Tapos na ang pag-ikot sa buong barangay para sa araw na ito.',
        ];
    }

    public static function zoneNames(): array
    {
        return [
            'Zone 1 – Purok Mabuhay',
            'Zone 2 – Sitio Bagong Pag-asa',
            'Zone 3 – Purok Silangan',
            'Zone 4 – Sitio Maliwanag',
            'Zone 5 – Purok Pagasa',
        ];
    }

    public static function zoneDescriptions(): array
    {
        return [
            'Sumasaklaw sa mga tahanan sa hilaga ng barangay malapit sa kalsada.',
            'Matatagpuan sa gawing kanluran kung saan matatagpuan ang komunidad ng mga manggagawa.',
            'Ang pinakamalaking zone na sumasakop sa silangang bahagi ng barangay.',
            'Isang maliit na komunidad sa timog na kilala sa pagiging aktibo sa mga programang pangkalinisan.',
            'Sentro ng barangay kung saan matatagpuan ang karamihan sa mga establisyimento.',
        ];
    }

    public static function barangayNames(): array
    {
        return [
            'Barangay Poblacion',
            'Barangay San Jose',
            'Barangay San Isidro',
            'Barangay Santa Lucia',
            'Barangay Santo Tomas',
            'Barangay Maligaya',
            'Barangay Bagong Pag-asa',
            'Barangay Magsaysay',
            'Barangay Rizal',
            'Barangay Bonifacio',
        ];
    }
}
