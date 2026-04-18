export const MAPEL_BIDANG_STUDI = [
    "Pendidikan Agama Islam (PAI)",
    "PJOK"
];

export function getMataPelajaranByKelas(kelas: number){
    const mapelGuruKelas = [
        "Matematika",
        "Bahasa Indonesia",
        "Bahasa Inggris",
        "Pendidikan Pancasila",
        "Seni Budaya"
    ];
    if(kelas >= 3 && kelas <= 6){
        mapelGuruKelas.push("IPAS");
    }
    return {
        mapelGuruKelas: mapelGuruKelas,
        mapelBidangStudi: MAPEL_BIDANG_STUDI,
        semuaMapel: [...mapelGuruKelas, ...MAPEL_BIDANG_STUDI]
    };
}

export function getRombelByKelas(kelas: number) {
    if(kelas >= 5) {
        return ["A", "B"];
    }
    return ["A", "B", "C"];
}