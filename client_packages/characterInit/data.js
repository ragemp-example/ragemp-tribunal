const skinColor = [0, 2, 4, 6, 8, 10];
const fathers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 43, 44];
const mothers = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 45];
const fatherNames = ["Бенджамин", "Дэниэл", "Джошуа", "Ной", "Эндрю", "Хуан", "Алекс", "Айзек", "Эван", "Итан", "Винсент", "Энджел", "Диего", "Адриан", "Габриэль", "Майкл", "Сантьяго", "Кевин", "Луи", "Сэмюэль", "Энтони", "Клод", "Нико", "Джон"];
const motherNames = ["Ханна", "Обри", "Жасмин", "Жизель", "Амелия", "Изабелла", "Зоуи", "Ава", "Камила", "Вайолет", "София", "Эвелин", "Николь", "Эшли", "Грейси", "Брианна", "Натали", "Оливия", "Элизабет", "Шарлотта", "Эмма", "Мисти"];
const featureNames = ["Nose Width", "NoseBottom Height", "NoseTip Length", "NoseBridge Depth", "NoseTip Height", "Nose Broken", "Brow Height", "Brow Depth", "Cheekbone Height", "Cheekbone Width", "Cheek Depth", "Eye Size", "Lip Thickness", "Jaw Width", "Jaw Shape", "Chin Height", "Chin Depth", "Chin Width", "Chin Indent", "Neck Width"];
const headOverlaysNames = ["Blemishes", "Facial Hair", "Eyebrows", "Ageing", "Makeup", "Blush", "Complexion", "Sun Damage", "Lipstick", "Moles Freckles", "Chest Hair"];

const headOverlayItems = [
    // blemishes
    ["None", "Measles", "Pimples", "Spots", "Break Out", "Blackheads", "Build Up", "Pustules", "Zits", "Full Acne", "Acne", "Cheek Rash", "Face Rash", "Picker", "Puberty", "Eyesore", "Chin Rash", "Two Face", "T Zone", "Greasy", "Marked", "Acne Scarring", "Full Acne Scarring", "Cold Sores", "Impetigo"],
    // facial hair
    ["None", "Light Stubble", "Balbo", "Circle Beard", "Goatee", "Chin", "Chin Fuzz", "Pencil Chin Strap", "Scruffy", "Musketeer", "Mustache", "Trimmed Beard", "Stubble", "Thin Circle Beard", "Horseshoe", "Pencil and 'Chops", "Chin Strap Beard", "Balbo and Sideburns", "Mutton Chops", "Scruffy Beard", "Curly", "Curly & Deep Stranger", "Handlebar", "Faustic", "Otto & Patch", "Otto & Full Stranger", "Light Franz", "The Hampstead", "The Ambrose", "Lincoln Curtain"],
    // eyebrows
    ["None", "Balanced", "Fashion", "Cleopatra", "Quizzical", "Femme", "Seductive", "Pinched", "Chola", "Triomphe", "Carefree", "Curvaceous", "Rodent", "Double Tram", "Thin", "Penciled", "Mother Plucker", "Straight and Narrow", "Natural", "Fuzzy", "Unkempt", "Caterpillar", "Regular", "Mediterranean", "Groomed", "Bushels", "Feathered", "Prickly", "Monobrow", "Winged", "Triple Tram", "Arched Tram", "Cutouts", "Fade Away", "Solo Tram"],
    // ageing
    ["None", "Crow's Feet", "First Signs", "Middle Aged", "Worry Lines", "Depression", "Distinguished", "Aged", "Weathered", "Wrinkled", "Sagging", "Tough Life", "Vintage", "Retired", "Junkie", "Geriatric"],
    // makeup
    ["None", "Smoky Black", "Bronze", "Soft Gray", "Retro Glam", "Natural Look", "Cat Eyes", "Chola", "Vamp", "Vinewood Glamour", "Bubblegum", "Aqua Dream", "Pin Up", "Purple Passion", "Smoky Cat Eye", "Smoldering Ruby", "Pop Princess"],
    // blush
    ["None", "Full", "Angled", "Round", "Horizontal", "High", "Sweetheart", "Eighties"],
    // complexion
    ["None", "Rosy Cheeks", "Stubble Rash", "Hot Flush", "Sunburn", "Bruised", "Alchoholic", "Patchy", "Totem", "Blood Vessels", "Damaged", "Pale", "Ghostly"],
    // sun damage
    ["None", "Uneven", "Sandpaper", "Patchy", "Rough", "Leathery", "Textured", "Coarse", "Rugged", "Creased", "Cracked", "Gritty"],
    // lipstick
    ["None", "Color Matte", "Color Gloss", "Lined Matte", "Lined Gloss", "Heavy Lined Matte", "Heavy Lined Gloss", "Lined Nude Matte", "Liner Nude Gloss", "Smudged", "Geisha"],
    // freckles
    ["None", "Cherub", "All Over", "Irregular", "Dot Dash", "Over the Bridge", "Baby Doll", "Pixie", "Sun Kissed", "Beauty Marks", "Line Up", "Modelesque", "Occasional", "Speckled", "Rain Drops", "Double Dip", "One Sided", "Pairs", "Growth"],
    // chest hair
    ["None", "Natural", "The Strip", "The Tree", "Hairy", "Grisly", "Ape", "Groomed Ape", "Bikini", "Lightning Bolt", "Reverse Lightning", "Love Heart", "Chestache", "Happy Face", "Skull", "Snail Trail", "Slug and Nips", "Hairy Arms"]
];

const hairList = [
    // male leng 38
    [
        {ID: 0, Name: "Close Shave", Collection: "mpbeach_overlays", Overlay: "FM_Hair_Fuzz"},
        {ID: 1, Name: "Buzzcut", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_001"},
        {ID: 2, Name: "Faux Hawk", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_002"},
        {ID: 3, Name: "Hipster", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_003"},
        {ID: 4, Name: "Side Parting", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_004"},
        {ID: 5, Name: "Shorter Cut", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_005"},
        {ID: 6, Name: "Biker", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_006"},
        {ID: 7, Name: "Ponytail", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_007"},
        {ID: 8, Name: "Cornrows", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_008"},
        {ID: 9, Name: "Slicked", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_009"},
        {ID: 10, Name: "Short Brushed", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_013"},
        {ID: 11, Name: "Spikey", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_002"},
        {ID: 12, Name: "Caesar", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_011"},
        {ID: 13, Name: "Chopped", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_012"},
        {ID: 14, Name: "Dreads", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_014"},
        {ID: 15, Name: "Long Hair", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_015"},
        {ID: 16 + 175, Name: "Shaggy Curls", Collection: "multiplayer_overlays", Overlay: "NGBea_M_Hair_000"},
        {ID: 17 + 175, Name: "Surfer Dude", Collection: "multiplayer_overlays", Overlay: "NGBea_M_Hair_001"},
        {ID: 18 + 175, Name: "Short Side Part", Collection: "multiplayer_overlays", Overlay: "NGBus_M_Hair_000"},
        {ID: 19 + 175, Name: "High Slicked Sides", Collection: "multiplayer_overlays", Overlay: "NGBus_M_Hair_001"},
        {ID: 20 + 175, Name: "Long Slicked", Collection: "multiplayer_overlays", Overlay: "NGHip_M_Hair_000"},
        {ID: 21 + 175, Name: "Hipster Youth", Collection: "multiplayer_overlays", Overlay: "NGHip_M_Hair_001"},
        {ID: 22 + 175, Name: "Mullet", Collection: "multiplayer_overlays", Overlay: "NGInd_M_Hair_000"},
        {ID: 24 + 175, Name: "Classic Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_M_Hair_000"},
        {ID: 25 + 175, Name: "Palm Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_M_Hair_001"},
        {ID: 26 + 175, Name: "Lightning Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_M_Hair_002"},
        {ID: 27 + 175, Name: "Whipped Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_M_Hair_003"},
        {ID: 28 + 175, Name: "Zig Zag Cornrows", Collection: "mplowrider2_overlays", Overlay: "LR_M_Hair_004"},
        {ID: 29 + 175, Name: "Snail Cornrows", Collection: "mplowrider2_overlays", Overlay: "LR_M_Hair_005"},
        {ID: 30 + 175, Name: "Hightop", Collection: "mplowrider2_overlays", Overlay: "LR_M_Hair_006"},
        {ID: 31 + 175, Name: "Loose Swept Back", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_000_M"},
        {ID: 32 + 175, Name: "Undercut Swept Back", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_001_M"},
        {ID: 33 + 175, Name: "Undercut Swept Side", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_002_M"},
        {ID: 34 + 175, Name: "Spiked Mohawk", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_003_M"},
        {ID: 35 + 175, Name: "Mod", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_004_M"},
        {ID: 36 + 175, Name: "Layered Mod", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_005_M"},
        {ID: 72 + 175, Name: "Flattop", Collection: "mpgunrunning_overlays", Overlay: "MP_Gunrunning_Hair_M_000_M"},
        {ID: 73 + 175, Name: "Military Buzzcut", Collection: "mpgunrunning_overlays", Overlay: "MP_Gunrunning_Hair_M_001_M"}
    ],
    // female leng 40
    [
        {ID: 0, Name: "Close Shave", Collection: "mpbeach_overlays", Overlay: "FM_Hair_Fuzz"},
        {ID: 1, Name: "Short", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_001"},
        {ID: 2, Name: "Layered Bob", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_002"},
        {ID: 3, Name: "Pigtails", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_003"},
        {ID: 4, Name: "Ponytail", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_004"},
        {ID: 5, Name: "Braided Mohawk", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_005"},
        {ID: 6, Name: "Braids", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_006"},
        {ID: 7, Name: "Bob", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_007"},
        {ID: 8, Name: "Faux Hawk", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_008"},
        {ID: 9, Name: "French Twist", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_009"},
        {ID: 10, Name: "Long Bob", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_010"},
        {ID: 11, Name: "Loose Tied", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_011"},
        {ID: 12, Name: "Pixie", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_012"},
        {ID: 13, Name: "Shaved Bangs", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_013"},
        {ID: 14, Name: "Top Knot", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_014"},
        {ID: 15, Name: "Wavy Bob", Collection: "multiplayer_overlays", Overlay: "NG_M_Hair_015"},
        {ID: 16 + 175, Name: "Messy Bun", Collection: "multiplayer_overlays", Overlay: "NGBea_F_Hair_000"},
        {ID: 17 + 175, Name: "Pin Up Girl", Collection: "multiplayer_overlays", Overlay: "NGBea_F_Hair_001"},
        {ID: 18 + 175, Name: "Tight Bun", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_007"},
        {ID: 19 + 175, Name: "Twisted Bob", Collection: "multiplayer_overlays", Overlay: "NGBus_F_Hair_000"},
        {ID: 20 + 175, Name: "Flapper Bob", Collection: "multiplayer_overlays", Overlay: "NGBus_F_Hair_001"},
        {ID: 21 + 175, Name: "Big Bangs", Collection: "multiplayer_overlays", Overlay: "NGBea_F_Hair_001"},
        {ID: 22 + 175, Name: "Braided Top Knot", Collection: "multiplayer_overlays", Overlay: "NGHip_F_Hair_000"},
        {ID: 23 + 175, Name: "Mullet", Collection: "multiplayer_overlays", Overlay: "NGInd_F_Hair_000"},
        {ID: 25 + 175, Name: "Pinched Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_F_Hair_000"},
        {ID: 26 + 175, Name: "Leaf Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_F_Hair_001"},
        {ID: 27 + 175, Name: "Zig Zag Cornrows", Collection: "mplowrider_overlays", Overlay: "LR_F_Hair_002"},
        {ID: 28 + 175, Name: "Pigtail Bangs", Collection: "mplowrider2_overlays", Overlay: "LR_F_Hair_003"},
        {ID: 29 + 175, Name: "Wave Braids", Collection: "mplowrider2_overlays", Overlay: "LR_F_Hair_003"},
        {ID: 30 + 175, Name: "Coil Braids", Collection: "mplowrider2_overlays", Overlay: "LR_F_Hair_004"},
        {ID: 31 + 175, Name: "Rolled Quiff", Collection: "mplowrider2_overlays", Overlay: "LR_F_Hair_006"},
        {ID: 32 + 175, Name: "Loose Swept Back", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_000_F"},
        {ID: 33 + 175, Name: "Undercut Swept Back", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_001_F"},
        {ID: 34 + 175, Name: "Undercut Swept Side", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_002_F"},
        {ID: 35 + 175, Name: "Spiked Mohawk", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_003_F"},
        {ID: 36 + 175, Name: "Bandana and Braid", Collection: "multiplayer_overlays", Overlay: "NG_F_Hair_003"},
        {ID: 37 + 175, Name: "Layered Mod", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_006_F"},
        {ID: 38 + 175, Name: "Skinbyrd", Collection: "mpbiker_overlays", Overlay: "MP_Biker_Hair_004_F"},
        {ID: 76 + 175, Name: "Neat Bun", Collection: "mpgunrunning_overlays", Overlay: "MP_Gunrunning_Hair_F_000_F"},
        {ID: 77 + 175, Name: "Short Bob", Collection: "mpgunrunning_overlays", Overlay: "MP_Gunrunning_Hair_F_001_F"}
    ]
];

const eyeColors = ["#50c878", "#008000", "#add8e6", "#0077be", "#b5651d", "#654321", "#d0c383", "#a9a9a9"];
const hairColor = [
    "#211f1c", "#55362f", "#4b382e", "#4d291b", 
    "#70351e", "#904422", "#a55c36", "#a56944", 
    "#ac744f", "#ae7d57", "#be9161", "#cda670", 
    "#c8a370", "#d5a861", "#e0b775", "#e8c487", 
    "#b78457", "#a85d3d", "#963523", "#7c1411", 
    "#921812", "#a81c14", "#cb371e", "#de411b", 
    "#be532f", "#d34d21", "#907867", "#a78e7a", 
    "#d4bda9", "#e4cfbe"
];
const lipColor = [
    "#211f1c", "#55362f", "#4b382e", "#4d291b", 
    "#70351e", "#904422", "#a55c36", "#a56944", 
    "#ac744f", "#ae7d57", "#be9161", "#cda670", 
    "#c8a370", "#d5a861", "#e0b775", "#e8c487", 
    "#b78457", "#a85d3d", "#963523", "#7c1411", 
    "#921812", "#a81c14", "#cb371e", "#de411b", 
    "#be532f", "#d34d21", "#907867", "#a78e7a", 
    "#d4bda9", "#e4cfbe", "#775262", "#8f5973", 
    "#ad4a6b", "#f845cc", "#fc5794", "#f9a1b2", 
    "#09a497", "#08828e", "#084e7c", "#63a15a", 
    "#379665", "#25705d", "#bec22f", "#9ab516", 
    "#61a526", "#e8bd56", "#f2c20e", "#f2980e", 
    "#fc8b14", "#f76415", "#fe771c", "#f1501f", 
    "#ef3c17", "#c81414", "#9b0a0e", "#291a14", 
    "#3f241c", "#502c1e", "#47271d", "#4d2c1f", 
    "#39251c", "#080a0e", "#ad8d67", "#c59762"
];

exports = {
    skinColor: skinColor,
    fathers: fathers,
    mothers: mothers,
    fatherNames: fatherNames,
    motherNames: motherNames,
    faceFeaturesNames: featureNames,
    headOverlays: headOverlaysNames,
    headOverlayItems: headOverlayItems,
    hairList: hairList,
    eyeColors: eyeColors,
    maxHairColor: hairColor.length,
    maxEyeColor: eyeColors.length,
    maxBlushColor: 27,
    maxLipstickColor: lipColor.length
};