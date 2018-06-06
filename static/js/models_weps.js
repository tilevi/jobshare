
/*
    Holds all of the player models and weapons.
    
    Sources (for the images):
    
        http://www.frostmournemc.com/gmod/orangebox/garrysmod/materials/spawnicons/models/
        https://csite.io/tools/gmod-universal-mdl
*/

var player_models = [
    [
        {image: "css_arctic.png", model: "models/player/arctic.mdl"},
        {image: "css_phoenix.png", model: "models/player/phoenix.mdl"},
        {image: "css_guerilla.png", model: "models/player/guerilla.mdl"},
        {image: "css_leet.png", model: "models/player/leet.mdl"}
    ],
    [
        {image: "alyx.png", model: "models/player/alyx.mdl"},
        {image: "eli.png", model: "models/player/eli.mdl"},
        {image: "kleiner.png", model: "models/player/kleiner.mdl"},
        {image: "monk.png", model: "models/player/monk.mdl"}
    ],
    [
        {image: "police.png", model: "models/player/police.mdl"},
        {image: "combineelite.png", model: "models/player/combine_super_soldier.mdl"},
        {image: "combineprison.png", model: "models/player/combine_soldier_prisonguard.mdl"},
        {image: "combine.png", model: "models/player/combine_soldier.mdl"}
    ],
    [
        {image: "male11.png", model: "models/player/Group03/male_01.mdl"},
        {image: "male12.png", model: "models/player/Group03/male_03.mdl"},
        {image: "male13.png", model: "models/player/Group03/male_04.mdl"},
        {image: "male14.png", model: "models/player/Group03/male_05.mdl"}
    ],
    [
        {image: "male15.png", model: "models/player/Group03/male_06.mdl"},
        {image: "male16.png", model: "models/player/Group03/male_07.mdl"},
        {image: "male17.png", model: "models/player/Group03/male_08.mdl"},
        {image: "male18.png", model: "models/player/Group03/male_09.mdl"}
    ], 
    [
        {image: "mossmanarctic.png", model: "models/player/mossman_arctic.mdl"},
        {image: "odessa.png", model: "models/player/odessa.mdl"},
        {image: "magnusson.png", model: "models/player/magnusson.mdl"},
        {image: "gman.png", model: "models/player/gman_high.mdl"}
    ],
    [
        {image: "css_gasmask.png", model: "models/player/gasmask.mdl"},
        {image: "css_urban.png", model: "models/player/urban.mdl"},
        {image: "css_riot.png", model: "models/player/riot.mdl"},
        {image: "css_swat.png", model: "models/player/swat.mdl"}
    ],
    [
        {image: "zombiefast.png", model: "models/player/zombie_fast.mdl"},
        {image: "zombie.png", model: "models/player/zombie_classic.mdl"},
        {image: "corpse.png", model: "models/player/corpse1.mdl"},
        {image: "charple.png", model: "models/player/charple.mdl"}
    ]
];

var weapons = [
        { name: "Lockpick", class: "lockpick" },
        { name: "Keypad Cracker", class: "keypad_cracker" },
        { name: "Stunstick", class: "weapon_stunstick" },
        { name: "Arrest Baton", class: "arrest_stick" },
        { name: "Unarrest Baton", class: "unarrest_stick" },
        { name: "Bugbait", class: "weapon_bugbait" },
        { name: "Glock", class: "weapon_glock" },
        { name: "USP", class: "weapon_usp" },
        { name: "P228", class: "weapon_p228" },
        { name: "Deagle", class: "weapon_deagle" },
        { name: "Five-seven", class: "weapon_fiveseven" },
        { name: "Shotgun", class: "weapon_shotgun" },
        { name: "M3", class: "weapon_m3" },
        { name: "Galil", class: "weapon_galil" },
        { name: "AK-47", class: "weapon_ak47" },
        { name: "Scout", class: "weapon_scout" },
        { name: "SG 552", class: "weapon_sg552" },
        { name: "AWP", class: "weapon_awp" },
        { name: "G3SG1", class: "weapon_g3sg1" },
        { name: "Famas", class: "weapon_famas" },
        { name: "M4A1", class: "weapon_m4a1" },
        { name: "AUG", class: "weapon_aug" },
        { name: "SG 550", class: "weapon_sg550" },
        { name: "Mac-10", class: "weapon_mac10" },
        { name: "TMP", class: "weapon_tmp" },
        { name: "MP5", class: "weapon_mp5navy" },
        { name: "UMP 45", class:"weapon_ump45" },
        { name: "P90", class: "weapon_p90" },
        { name: "M249", class: "weapon_m249" }
    ]