export const MAPEL_BIDANG_STUDI = [
    "Pendidikan Agama Islam (PAI)",
    "PJOK"
];

export const EKSKUL_LIST = [
    "Pramuka",
    "Tari",
    "Futsal"
];

export const EKSKUL_GRADE_SCALE = {
    "A": 4,
    "B": 3,
    "C": 2,
    "-": 0,
}

export function getMataPelajaranByKelas(kelas: number){
    const mapelGuruKelas = [
        "Matematika",
        "Bahasa Indonesia",
        "Bahasa Inggris",
        "Pendidikan Pancasila",
        "Seni Budaya",
    ];
    
    // IPAS hanya untuk kelas 3 sampai 6
    if(kelas >= 3){
        mapelGuruKelas.push("IPAS");
    }

    // Mata pelajaran tambahan / Mulok
    const mulokList = ["Mulok", "BTQ", "TIK"];
    
    return {
        mapelGuruKelas: mapelGuruKelas,
        mapelBidangStudi: [...MAPEL_BIDANG_STUDI, ...mulokList],
        semuaMapel: [...mapelGuruKelas, ...MAPEL_BIDANG_STUDI, ...mulokList],
        ekskul: EKSKUL_LIST,
    };
}

export function getRombelByKelas(kelas: number) {
    if(kelas >= 5) {
        return ["A", "B"];
    }
    return ["A", "B", "C"];
}