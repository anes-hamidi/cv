
export const algeriaLocalities = [
    {
        "wilaya_code": "01",
        "wilaya_name": "Adrar",
        "municipalities": ["Adrar", "Tamest", "Charouine", "Reggane", "In-Zghmir", "Tit", "Ksar Kaddour", "Tsabit", "Timimoun", "Ouled Said", "Zaouiet Kounta", "Aoulef", "Tamekten", "Timokten", "Fenoughil"]
    },
    {
        "wilaya_code": "02",
        "wilaya_name": "Chlef",
        "municipalities": ["Chlef", "Ténès", "Béni Haoua", "Oued Goussine", "Sidi Akkacha", "Sidi Abderrahmane", "El Marsa", "Chettia", "Ouled Fares", "El Karimia", "Harchoun", "Sendjas", "Abou El Hassan", "Tadjena"]
    },
    {
        "wilaya_code": "16",
        "wilaya_name": "Alger",
        "municipalities": ["Alger Centre", "Sidi M'Hamed", "El Madania", "Hamma-Anassers", "Bab El Oued", "Bologhine", "Casbah", "Oued Koriche", "Bir Mourad Raïs", "El Biar", "Bouzaréah", "Birkhadem", "El Harrach", "Baraki", "Oued Smar", "Bachdjerrah", "Hussein Dey", "Kouba", "Bourouba", "Dar El Beïda", "Bab Ezzouar", "Ben Aknoun", "Dely Ibrahim", "El Achour", "Hydra", "Mohammadia"]
    },
    {
        "wilaya_code": "31",
        "wilaya_name": "Oran",
        "municipalities": ["Oran", "Gdyel", "Bir El Djir", "Hassi Bounif", "Es Senia", "Arzew", "Bethioua", "Marsat El Hadjadj", "Aïn Turk", "El Ançor", "Oued Tlelat", "Tafraoui", "Sidi Chami", "Boufatis", "Mers El Kébir"]
    }
];

export const allMunicipalities = algeriaLocalities.flatMap(wilaya => 
    wilaya.municipalities.map(municipality => ({
        value: `${municipality}, ${wilaya.wilaya_name}`,
        label: `${municipality} (${wilaya.wilaya_name})`,
    }))
);
