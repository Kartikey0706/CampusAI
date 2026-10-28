"""Builds ai/datasets/complaints_v2.csv (category + urgency labels).

Sources, merged and de-duplicated:
  1. Hand-written seed complaints below (Hinglish, English, typos, SMS style).
     A leading "!" marks High urgency and "~" marks Medium; no mark is Low.
  2. Controlled variations of those seeds (location prefix, duration or scale
     suffix). A suffix can only raise the urgency, never lower it.
  3. The original complaints_category.csv (category label only).

The hand-written *evaluation* set lives in dev_set.csv and is never used here.

Run:  python ai/training/build_dataset.py
"""

import csv
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
OUT_PATH = BASE_DIR / "ai" / "datasets" / "complaints_v2.csv"
OLD_PATH = BASE_DIR / "ai" / "datasets" / "complaints_category.csv"

SEEDS = {
    "Wi-Fi": [
        "wifi nahi chal raha hostel me", "campus wifi bahut slow hai", "internet baar baar disconnect ho raha hai",
        "Wi-Fi is not working in my room", "unable to connect to the college wifi", "net bilkul nahi aa raha",
        "hostel ka internet speed bahut kam hai", "wifi password kaam nahi kar raha", "router band pada hai second floor ka",
        "wifi signal weak hai mere room me", "online class ke time internet chala jata hai", "library me wifi connect nahi ho raha",
        "wifi login page open nahi ho raha", "internet keeps dropping every few minutes", "no internet in the academic block",
        "wi fi ka network dikh hi nahi raha", "student wifi me authentication failed aa raha hai", "lab ka internet slow hai",
        "hotspot jaisa bhi net nahi chal raha campus me", "wifi connected hai par internet nahi chal raha",
        "assignment upload nahi ho paa raha wifi slow hone ki wajah se", "bandwidth bahut kam hai raat ko",
        "ethernet port kaam nahi kar raha room me", "wifi coverage nahi hai canteen ke paas", "net speed 1 mbps bhi nahi aati",
        "wireless network keeps disconnecting", "campus network down hai", "internet nhi chal rha yrr",
        "wifi ki problem hai bahut din se", "WiFi router ki light blink kar rahi hai net nahi aa raha",
        "internet connection unstable hai", "video call me wifi baar baar kat jata hai",
        "~wifi 2 din se band hai poore hostel me", "~internet kal se nahi chal raha exams ki tayari ho rahi hai",
        "~wifi down since morning in the whole block", "~net baar baar jata hai daily problem hai",
    ],
    "Water": [
        "pani nahi aa raha hostel me", "water supply band hai", "drinking water nahi mil raha", "tap se pani nahi aa raha",
        "washroom me pani nahi hai", "there is no water in the bathroom", "water cooler me pani nahi hai",
        "pani ki tanki khali hai", "paani bahut kam pressure se aa raha hai", "garam pani nahi aa raha geyser kharab hai",
        "water tank overflow ho raha hai", "pipeline leak ho rahi hai corridor me", "nal toota hua hai pani beh raha hai",
        "pani me smell aa rahi hai", "drinking water cooler ka pani gandla hai", "RO ka pani kharab taste ka hai",
        "water leakage in the washroom", "bathroom ka tap band nahi ho raha", "pani subah se nahi aaya",
        "no water supply on 3rd floor", "pani peene layak nahi hai", "water filter band pada hai",
        "pyaas lagi hai par water cooler kharab hai", "hostel me paani ki bahut problem hai", "hot water not available in morning",
        "nahane ke liye pani nahi hai", "water pressure is too low", "water dispenser kharab hai library ke paas",
        "paani nahi aa rha yrr", "pani ka tap tut gaya hai",
        "~pani 2 din se nahi aa raha poore hostel me", "~water supply stopped since yesterday", "~3 ghante se pani nahi aa raha",
        "!pani me keede aa rahe hain peene ka pani gandha hai", "!drinking water is contaminated students are falling sick",
        "!pipeline fat gayi hai aur bijli ke paas pani beh raha hai",
    ],
    "Electricity": [
        "bijli nahi hai room me", "light baar baar ja rahi hai", "electricity keeps going off", "fan nahi chal raha power issue hai",
        "tube light kharab hai corridor ki", "lights are not working in the classroom", "power cut hota rehta hai",
        "socket me bijli nahi aa rahi", "room ka switch board kharab hai", "voltage bahut kam hai", "inverter kaam nahi kar raha",
        "no power in my room", "bijli gayi hui hai subah se", "street light kharab hai gate ke paas", "light jal nahi rahi hai",
        "mcb baar baar trip ho raha hai", "power supply interrupted in lab", "generator start nahi hua light gayi to",
        "frequent power cuts in hostel", "bulb fuse ho gaya hai", "charging point kaam nahi kar raha", "bijli ka bill extra aaya hai",
        "light flicker kar rahi hai", "electricity nhi hai yrr", "corridor ki lights band hain andhera rehta hai",
        "~bijli 3 ghante se nahi hai exams chal rahe hain", "~light roz raat ko jati hai", "~power outage in whole hostel since evening",
        "!switch board se chingari nikal rahi hai", "!exposed wire hai corridor me bahut khatarnak", "!short circuit ho gaya hai room me aag lagne ka dar hai",
        "!current lag gaya mujhe switch chhute hi", "!wire sparking near the main board", "!transformer se dhuan nikal raha hai",
    ],
    "Mess": [
        "mess ka khana accha nahi hai", "khane me swad nahi hai", "mess me khana thanda milta hai", "dal me paani hi paani hai",
        "roti kachi hai mess ki", "food quality is very poor in mess", "mess menu follow nahi hota", "mess ke bartan gande hain",
        "khana time pe nahi milta", "mess me kam khana milta hai", "breakfast me roz same cheez milti hai", "chawal me kankad nikla",
        "sabzi bahut tikhi hai", "mess ke kitchen me safai nahi hai", "canteen ka khana mehenga aur kharab hai",
        "dinner late start hota hai mess me", "paneer ki jagah aloo dete hain", "mess staff ka behaviour kharab hai",
        "khane me baal mila hai", "plates dhoye nahi jaate theek se", "hostel mess me hygiene ki problem hai",
        "lunch me roti nahi mili", "mess ki chai bahut bekar hai", "food is always cold and tasteless",
        "~mess ke khane me badbu aa rahi hai", "~khana stale tha kal ka bacha hua", "~mess food bahut din se kharab aa raha hai",
        "~khane ki quality repeat problem hai roz", "!khane me insect mila hai", "!khana khane ke baad ulti ho gayi",
        "!mess ka khana khane ke baad kai students bimar pade", "!food poisoning ho gaya mess ka khana khake", "!khane me cockroach nikla",
        "!dal me keede the", "!students became sick after eating mess food", "!bacche ko khana khane ke baad pet dard aur bukhar hua",
    ],
    "Faculty": [
        "teacher class nahi le rahe", "professor ka behaviour theek nahi hai", "sir roz late aate hain class me",
        "faculty attendance galat lagata hai", "teacher samjhate nahi hain topic", "professor ne marks galat diye",
        "lecture bina padhaye khatam kar diya", "teacher office hours me available nahi hote", "faculty member students se rudely baat karta hai",
        "sir syllabus complete nahi karwa rahe", "ma'am ne bina wajah attendance cut ki", "teaching quality is very poor",
        "professor phone pe busy rehte hain class me", "teacher kai din se absent hain", "HOD se milne ka time nahi mil raha",
        "faculty favoritism karta hai", "prof class me aate hi nahi", "professor doubts clear nahi karte",
        "teacher ne notes nahi diye", "lecturer ka pronunciation samajh nahi aata", "mentor se contact nahi ho pa raha",
        "faculty replies nahi karte emails ka", "sir ne attendance shortage bol ke exam nahi dene diya",
        "~teacher 2 hafte se nahi aaye class me", "~professor baar baar class cancel kar dete hain",
        "!teacher ne student ko sabke samne bahut insult kiya", "!professor ne dhamki di hai fail karne ki",
    ],
    "Academic": [
        "assignment submission ki date badhani chahiye", "exam ka result nahi aaya abhi tak", "marks sheet me galti hai",
        "syllabus me naye topics add ho gaye bina bataye", "revaluation ka form kab aayega", "internal marks update nahi hue",
        "exam form portal pe nahi khul raha", "backlog exam ki date kab hai", "admit card nahi mila exam ka",
        "result me mera naam galat likha hai", "course registration nahi ho raha", "project submission portal band hai",
        "quiz ke marks nahi dikh rahe", "answer sheet dekhne ko nahi mili", "viva ki date announce nahi hui",
        "elective subject change karna hai", "exam hall me seating plan galat tha", "question paper out of syllabus tha",
        "final result is not updated on portal", "mid sem marks abhi tak upload nahi hue", "assessment criteria clear nahi hai",
        "course material available nahi hai", "exam ka paper bahut lamba tha time kam tha", "grade card me CGPA galat hai",
        "~exam kal hai aur admit card abhi tak nahi mila", "~result me galti ki wajah se scholarship ruk sakti hai",
        "~assignment deadline kal hai par portal nahi chal raha",
    ],
    "Timetable": [
        "timetable galat hai", "do classes ek hi time pe hain", "timetable update nahi hua", "class timing change karni hai",
        "lecture ka time clash ho raha hai", "mera timetable me subject missing hai", "time table me wrong classroom likha hai",
        "lunch break nahi hai timetable me", "saturday ki class schedule galat hai", "exam timetable me date clash hai",
        "schedule me last minute change ho jate hain", "timetable pe duplicate lecture dikh raha hai",
        "class schedule PDF purani hai", "practical ka time lecture se overlap ho raha hai", "free period nahi mil raha poore din",
        "timetable section B ka galat upload hua hai", "morning class 8 baje ki hai bahut jaldi hai", "lab slot aur lecture slot clash",
        "class timetable not available on portal", "schedule me teacher ka naam galat hai",
        "~kal ke exam ki timetable me clash hai", "~class ka time kal se badal gaya par kisi ko bataya nahi",
    ],
    "Hostel": [
        "hostel room me maintenance chahiye", "room allocation me problem hai", "warden available nahi hote", "roommate se dikkat hai room change chahiye",
        "room ka lock kharab hai", "mere room ka fan kharab hai", "hostel ki khidki toot gayi hai", "mattress purana aur gandha hai",
        "almirah ka darwaza toota hai", "hostel gate timing bahut jaldi hai", "laundry service time pe nahi aati",
        "room me bed bug hain", "hostel me visitors allowed nahi hain family ko bhi", "hostel ki chhat se paani tapakta hai",
        "room cleaning nahi hoti", "cupboard ki chabi kho gayi hai", "hostel block me bahut shor hota hai raat ko",
        "room ka darwaza band nahi hota", "hostel curfew too strict", "room shift karna hai second floor se",
        "hostel facilities not proper", "warden complaint sunte hi nahi", "room ki dewar me seelan aa gayi hai",
        "hostel fee ke baad bhi room nahi mila", "room me ac nahi hai jabki promise kiya tha",
        "~room ka lock 2 din se kharab hai samaan ki fikar hai", "!hostel me raat ko koi andar aa gaya tha room ka lock kharab hai",
        "!room ki chhat girne wali hai", "!hostel ke room me saanp nikla",
    ],
    "Classroom": [
        "classroom ka projector kaam nahi kar raha", "classroom me fan nahi chal raha", "class me bench toote hue hain",
        "classroom me AC band hai", "board par likha dikhta nahi", "classroom ki lights kharab hain",
        "class me seating kam hai", "whiteboard marker nahi milte", "classroom bahut gandi hai", "projector ki screen phat gayi hai",
        "smart board touch nahi kar raha", "class room me garmi bahut hai", "desk bahut chhoti hain", "class ka darwaza toota hua hai",
        "classroom me mic kaam nahi karta", "seminar hall ka AC kharab hai", "lecture hall me sound system band hai",
        "classroom me charging socket nahi hai", "classroom ki khidki band nahi hoti baarish ka pani aata hai", "class me speaker ki awaz nahi aati",
        "projector not working in room 204", "blackboard ka duster nahi hai", "classroom not properly maintained",
        "auditorium ke seats toote hain", "classroom me dustbin nahi hai", "class me pankhe bahut dheere chalte hain",
        "~classroom ka AC 1 hafte se kharab hai", "!classroom ka fan hil raha hai gir sakta hai", "!class ki chhat ka plaster gir gaya",
    ],
    "Transport": [
        "bus time pe nahi aati", "college bus bahut crowded hai", "bus ka route change ho gaya bina bataye", "bus driver rashly chalata hai",
        "bus stop pe koi shelter nahi hai", "bus timing galat hai portal pe", "bus ki seats toot gayi hain", "morning bus miss ho gayi driver ne wait nahi kiya",
        "bus pass nahi ban raha", "shuttle service band hai", "bus me ac nahi chalta", "transport department phone nahi uthata",
        "bus fees badha di bina bataye", "bus late aane se class miss hoti hai", "bus conductor ka behaviour kharab hai",
        "campus shuttle available nahi hai raat ko", "bus overloaded hai log latak ke jaate hain", "route 5 ki bus roz late hai",
        "bus ki khidkiyan toot gayi hain", "transport schedule update nahi hua",
        "~bus 1 hafte se nahi aa rahi route par", "!bus driver sharab pi ke chala raha tha", "!bus ka brake fail ho gaya tha raste me",
        "!driver bahut tez chalata hai accident hote hote bacha",
    ],
    "Fees": [
        "fee payment show nahi ho raha", "fees ka receipt nahi mila", "payment kat gaya par fee update nahi hui", "scholarship ka paisa nahi aaya",
        "fee portal open nahi ho raha", "refund kab milega", "tuition fee galat dikha rahe hain", "hostel fee double charge hui hai",
        "fee deadline ke baad late fine laga diya", "challan download nahi ho raha", "fee structure clear nahi hai",
        "transaction failed lekin paisa kat gaya", "caution money wapas nahi mili", "dues clear hone ke baad bhi no dues certificate nahi mila",
        "scholarship amount fees me adjust nahi hua", "installment ka option chahiye", "fee receipt me naam galat hai",
        "online payment gateway error aa raha hai", "exam fee do baar kat gayi", "fees ki jankari office se nahi mil rahi",
        "~payment kat gaya hai aur kal last date hai fees ki", "~double payment ho gaya refund chahiye",
    ],
    "Library": [
        "library me book available nahi hai", "library timing badhani chahiye", "library ka AC band hai", "book issue nahi ho rahi",
        "library me bahut shor hota hai", "reading room me seat nahi milti", "library ka computer kharab hai", "book return karne par fine laga diya galat",
        "librarian rudely baat karte hain", "journal access nahi mil raha", "library card nahi bana", "library me charging socket nahi hai",
        "purani edition ki books hain nayi chahiye", "library ka database kaam nahi karta", "library band mil rahi hai time pe khulti nahi",
        "reference books ghar le jaane nahi dete", "library me bathroom nahi hai", "digital library ka login nahi ho raha",
        "library ki lights kam hain padhne me dikkat", "exam time me library 24 hours khuli rakhni chahiye",
        "~library me paani tapak raha hai books kharab ho rahi hain",
    ],
    "Lab": [
        "lab me computers kaam nahi kar rahe", "computer lab ke systems slow hain", "lab equipment toota hua hai", "practical ke liye apparatus kam hai",
        "lab me software install nahi hai", "lab ka AC band hai", "chemistry lab me chemicals kam hain", "lab assistant available nahi hota",
        "lab ki keyboard aur mouse kharab hain", "lab me projector nahi chal raha", "physics lab ke instruments purane hain",
        "lab me internet nahi chal raha", "lab timing sirf 2 ghante hai", "lab manual nahi mila", "lab ka UPS kharab hai systems band ho jate hain",
        "practical ke time pe lab band mili", "lab me ek system pe 3 students baithte hain", "microscope kharab hai biology lab me",
        "lab computers me virus hai", "lab me kaam karne ke liye gloves nahi hain",
        "!lab me gas leak ki smell aa rahi hai", "!chemistry lab me aag lag gayi", "!lab me acid gir gaya aur safety kit nahi hai",
        "!lab ki wiring se current aa raha hai",
    ],
    "Security": [
        "gate pe security guard nahi hota raat ko", "campus me bahar ke log ghoomte hain", "cctv camera kaam nahi kar rahe", "meri bike chori ho gayi parking se",
        "laptop chori ho gaya hostel se", "raat ko campus me andhera rehta hai safe nahi lagta", "guard entry register nahi bharta",
        "bahar ke ladke girls hostel ke paas khade rehte hain", "visitor bina pass ke andar aa gaye", "hostel ka main gate khula rehta hai",
        "security guard sota rehta hai", "mera wallet chori ho gaya common room se", "cctv footage dikhane se mana kar rahe hain",
        "late night entry pe guard rok raha hai bina wajah", "parking me bikes ki chori hoti rehti hai", "security ne id card check nahi kiya outsider andar aaya",
        "suspicious log campus ke andar dikhe", "street dogs campus me dar paida karte hain", "campus night safety improve honi chahiye",
        "!kisi ne mere room me ghus kar samaan chura liya", "!raat ko ek aadmi hostel ki boundary kood ke andar aaya", "!girl students ko raste me koi follow kar raha tha",
        "!campus me chaku wale ladke ghoom rahe hain", "!hostel ke gate pe koi guard nahi aur bahar ke log andar aa gaye",
    ],
    "Ragging": [
        "!seniors ragging kar rahe hain hostel me", "!senior students raat ko room me bula ke pareshan karte hain", "!ragging ho rahi hai first year ke saath",
        "!mujhe seniors ne dhamki di hai complaint ki to", "!senior ne mujhe sabke samne beizzat kiya aur kapde utarne ko kaha", "!harassment ho rahi hai class me ek ladke se",
        "!koi mujhe baar baar message karke pareshan kar raha hai", "!eve teasing hoti hai bus stop pe", "!senior students force karke paisa maangte hain",
        "!bullying by seniors in hostel", "!mere saath misbehave kiya gaya aur dhamki mili", "!faculty ne mujhe galat tarike se chhua",
        "!blackmail kar raha hai photos viral karne ki dhamki deta hai", "!mujhe roz stalk kiya ja raha hai campus me", "!ragging complaint karne par seniors ne maara",
        "!freshers ko raat bhar jagakar kaam karwate hain", "!group of boys harass karte hain girls ko canteen ke paas", "!mujhe mentally torture kiya ja raha hai room me",
        "!first year ko seniors ke kapde dhone padte hain", "!harassment by a staff member",
    ],
    "Medical": [
        "~campus me doctor available nahi hai", "~medical room band tha jab tabiyat kharab thi", "~dispensary me dawai nahi hai", "~ambulance ki suvidha nahi hai",
        "!mere dost ko bukhar hai aur doctor nahi mil raha", "!student behosh ho gaya ambulance nahi aayi", "!class me ek ladki gir gayi aur first aid nahi mila",
        "!hostel me ek student ko seene me dard hua doctor nahi tha", "!accident ho gaya campus ke bahar turant madad chahiye", "!allergy reaction hua aur dispensary band thi",
        "!bahut tez bukhar hai kal se medical help chahiye", "!kisi ko saanp ne kata hai", "!student ko chot lagi hai khoon beh raha hai",
        "!ek student ne zyada dawai kha li hai", "!panic attack aaya aur counsellor nahi mila",
        "first aid box khali hai", "health centre ki timing bahut kam hai", "medical certificate ke liye doctor sign nahi karte",
        "counselling ki suvidha nahi hai campus me", "dispensary ka doctor behaviour kharab karta hai", "medical leave approve nahi ho rahi",
        "dawai expired mil rahi hai dispensary se", "health insurance card ki jankari chahiye", "physiotherapy ki suvidha chahiye",
    ],
    "Sanitation": [
        "washroom bahut gande hain", "toilet me paani nahi aur safai bhi nahi", "kooda roz nahi uthta", "dustbin bhar ke bahar gir raha hai",
        "corridor me machhar bahut hain", "hostel me cockroach bahut hain", "safai karne wale nahi aate", "bathroom ki naali jam gayi hai",
        "drain ka pani rasta band kar raha hai", "campus me jagah jagah kachra pada hai", "washroom me hand wash nahi hai", "toilet ki flush kharab hai",
        "hostel ke piche kooda jama hai badbu aati hai", "sewage ka pani overflow ho raha hai", "dustbin kam hain campus me",
        "bathrooms me light aur lock nahi hai", "housekeeping staff time pe nahi aata", "washroom me roz safai nahi hoti",
        "chuhe bahut hain hostel me", "common room bahut gandi hai", "sanitary pad vending machine khali hai", "urinal me badbu aur gandagi hai",
        "~kachra 4 din se nahi uthaya badbu phail rahi hai", "~drain jam hai gandagi se bimari ka darr hai", "!sewage ka pani hostel me ghus gaya hai",
        "!toilet me saanp dikha", "!washroom me gandagi se students bimar pad rahe hain",
    ],
    "Infrastructure": [
        "lift kaam nahi kar rahi", "seedhiyon ki railing toot gayi hai", "campus ki road me gaddhe hain", "parking me jagah nahi hai",
        "building ki deewar me crack aa gayi hai", "darwaza toot gaya hai", "ramp nahi hai disabled students ke liye", "campus me benches nahi hain baithne ke liye",
        "construction ka shor padhai me dikkat deta hai", "building ki painting nahi hui bahut saal se", "main gate ke paas road toot gayi hai",
        "khidki ke sheeshe toote hain", "staircase me light nahi hai", "campus me footpath nahi hai", "roof se paani tapakta hai baarish me",
        "elevator stuck ho gayi thi", "playground me gaddhe hain", "cafeteria ki building purani ho gayi hai", "furniture toota hua hai common area me",
        "campus ke andar potholes ki wajah se bikes girti hain", "ground ki boundary toot gayi hai", "shed ki chhat udd gayi hai",
        "~lift 2 hafte se band hai teesri manzil pe jaana mushkil hai", "!chhat ka hissa gir gaya", "!building me badi crack aayi hai girne ka darr hai",
        "!lift me log fas gaye the", "!seedhiyon ki railing toot gayi hai koi gir sakta hai",
    ],
    "Other": [
        "kuch problem hai", "i have a general complaint", "something is wrong here", "unclear issue here", "need help please",
        "admin se milna hai", "mujhe kuch batana tha", "is there any notice for holidays", "ID card ki photo galat lagi hai", "student id card nahi mila",
        "sports ground ka booking process kya hai", "college fest ke liye permission chahiye", "club registration kaise karein", "cultural event ke liye budget chahiye",
        "NCC ke liye form kahan milega", "gym equipment kharab hai", "swimming pool band hai", "sports kit nahi mil rahi", "placement cell se reply nahi aaya",
        "alumni id card kaise banega", "bonafide certificate chahiye", "noc letter chahiye internship ke liye", "college ka logo badalna chahiye",
        "canteen me ATM lagwa do", "campus me photocopy shop chahiye", "suggestion box rakhna chahiye", "feedback dena tha college ke bare me",
        "general student complaint", "i dont know where to report this", "complaint karna hai", "issue hai lekin samajh nahi aa raha kya",
        "mera naam list me nahi hai", "event ki date kab hai", "thank you for resolving my issue", "all fine just testing", "test complaint please ignore",
        "hello", "kuch dikkat hai help karo", "please look into this matter", "i want to talk to someone",
    ],
}

LOCATION_PREFIXES = [
    "", "", "", "", "hostel block A me ", "boys hostel me ", "girls hostel me ", "academic block me ", "library ke paas ",
    "in block B ", "second floor pe ", "main campus me ", "yaha ", "bhai ", "sir ", "hello ", "urgent nahi hai par ",
    "mess ke paas ", "near the canteen ", "room no 204 me ", "C block me ",
]

SCALE_SUFFIXES = [
    ("", "Low"), ("", "Low"), ("", "Low"), ("", "Low"), (" please fix", "Low"), (" kripya dhyan dein", "Low"), (" yrr", "Low"), (" bahut dikkat hai", "Low"),
    (" sabhi students ko dikkat hai", "Low"), (" poore block me yahi haal hai", "Low"), (" kaafi students affected hain", "Low"),
    (" subah se", "Medium"), (" kal se", "Medium"), (" 2 din se", "Medium"), (" 3 ghante se", "Medium"), (" kai din se", "Medium"),
    (" baar baar hota hai", "Medium"), (" since yesterday", "Medium"), (" for the last 2 days", "Medium"), (" daily ki problem hai", "Medium"),
    (" bahut urgent hai", "High"), (" emergency hai", "High"),
]

ORDER = {"Low": 0, "Medium": 1, "High": 2}
NAMES = {0: "Low", 1: "Medium", 2: "High"}


def parse_seed(raw):
    urgency = "Low"
    if raw.startswith("!"):
        urgency, raw = "High", raw[1:]
    elif raw.startswith("~"):
        urgency, raw = "Medium", raw[1:]
    return raw.strip(), urgency


def main():
    rng = random.Random(42)
    rows = {}

    def add(text, category, urgency):
        key = (text.lower().strip(), category)
        if key not in rows:
            rows[key] = urgency

    for category, seeds in SEEDS.items():
        for raw in seeds:
            text, urgency = parse_seed(raw)
            add(text, category, urgency)
            variations = 6 if category != "Other" else 3
            for _ in range(variations):
                prefix = rng.choice(LOCATION_PREFIXES)
                suffix, floor = rng.choice(SCALE_SUFFIXES)
                new_urgency = NAMES[max(ORDER[urgency], ORDER[floor])]
                add(f"{prefix}{text}{suffix}".strip(), category, new_urgency)

    # Original dataset: category only (urgency left blank so it is skipped when
    # training the urgency model).
    with open(OLD_PATH, newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            text = (row.get("text") or "").strip()
            category = (row.get("category") or "").strip()
            if text and category:
                key = (text.lower(), category)
                if key not in rows:
                    rows[key] = ""

    ordered = sorted(rows.items(), key=lambda item: (item[0][1], item[0][0]))
    with open(OUT_PATH, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["text", "category", "urgency"])
        for (text, category), urgency in ordered:
            writer.writerow([text, category, urgency])

    counts = {}
    for (_, category), _ in ordered:
        counts[category] = counts.get(category, 0) + 1
    print(f"Wrote {len(ordered)} rows to {OUT_PATH}")
    for category, count in sorted(counts.items()):
        print(f"  {category:15} {count}")


if __name__ == "__main__":
    main()
