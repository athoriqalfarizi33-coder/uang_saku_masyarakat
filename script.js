/* =================================
   DUITLY - POCKET MONEY MANAGER
   Manage Your Money, Build Your Future.
================================= */

// 1. MENGAMBIL ELEMEN HTML

const form = document.getElementById("formTransaksi");
const daftar = document.getElementById("daftarTransaksi");

const saldoEl = document.getElementById("saldo");
const pemasukanEl = document.getElementById("pemasukan");
const pengeluaranEl = document.getElementById("pengeluaran");

const targetInput = document.getElementById("target");
const progress = document.getElementById("progress");
const progressText = document.getElementById("progressText");


// 2. MENGAMBIL DATA DARI LOCAL STORAGE

let transaksi = JSON.parse(
    localStorage.getItem("transaksi") || "[]"
);

let target = Number(
    localStorage.getItem("target") || 0
);


// 3. FORMAT MATA UANG RUPIAH

function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}


// 4. MENYIMPAN DATA TRANSAKSI

function simpanData() {

    localStorage.setItem(
        "transaksi",
        JSON.stringify(transaksi)
    );

}


// 5. MENAMPILKAN DATA DASHBOARD

function tampilkanData() {

    let pemasukan = 0;
    let pengeluaran = 0;

    // Menghitung pemasukan dan pengeluaran

    transaksi.forEach(item => {

        if (item.jenis === "pemasukan") {
            pemasukan += item.jumlah;
        } else {
            pengeluaran += item.jumlah;
        }

    });

    // Menghitung saldo akhir

    let saldo = pemasukan - pengeluaran;

    // Memperbarui dashboard

    saldoEl.textContent = rupiah(saldo);
    pemasukanEl.textContent = rupiah(pemasukan);
    pengeluaranEl.textContent = rupiah(pengeluaran);


    // 6. MENAMPILKAN RIWAYAT TRANSAKSI

    daftar.replaceChildren();

    if (transaksi.length === 0) {

        daftar.textContent = "Belum ada transaksi.";

    }

    transaksi.forEach((item, index) => {

        const baris = document.createElement("div");
        baris.className = "transaksi";

        const informasi = document.createElement("div");

        const nama = document.createElement("strong");
        nama.textContent = item.keterangan;

        const tanggal = document.createElement("small");
        tanggal.textContent = item.tanggal;

        informasi.append(
            nama,
            document.createElement("br"),
            tanggal
        );

        const rincian = document.createElement("div");

        const nominal = document.createElement("span");

        nominal.className =
            item.jenis === "pemasukan"
                ? "masuk"
                : "keluar";

        nominal.textContent =
            (item.jenis === "pemasukan" ? "+ " : "- ")
            + rupiah(item.jumlah);

        // Tombol hapus transaksi

        const hapus = document.createElement("button");

        hapus.textContent = "Hapus";

        hapus.addEventListener("click", function() {

            transaksi.splice(index, 1);

            simpanData();

            tampilkanData();

        });

        rincian.append(
            nominal,
            document.createElement("br"),
            hapus
        );

        baris.append(informasi, rincian);

        daftar.appendChild(baris);

    });


    // 7. MENGHITUNG TARGET TABUNGAN

    let persentase = target > 0
        ? Math.max(0, Math.min(100, (saldo / target) * 100))
        : 0;

    progress.value = persentase;

    if (target > 0) {

        progressText.textContent =
            `Tabungan: ${rupiah(Math.max(0, saldo))} dari ${rupiah(target)} (${persentase.toFixed(1)}%)`;

    } else {

        progressText.textContent =
            "Target belum ditentukan.";

    }

}


// 8. MENAMBAHKAN TRANSAKSI BARU

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const keterangan = document
        .getElementById("keterangan")
        .value.trim();

    const jumlah = Number(
        document.getElementById("jumlah").value
    );

    const jenis = document.getElementById("jenis").value;

    // Memeriksa input pengguna

    if (
        !keterangan ||
        !Number.isSafeInteger(jumlah) ||
        jumlah <= 0
    ) {

        alert("Masukkan keterangan dan nominal yang valid!");

        return;

    }

    // Menghitung saldo saat ini

    let saldoSaatIni = 0;

    transaksi.forEach(item => {

        if (item.jenis === "pemasukan") {
            saldoSaatIni += item.jumlah;
        } else {
            saldoSaatIni -= item.jumlah;
        }

    });

    // Memeriksa kecukupan saldo

    if (jenis === "pengeluaran" && jumlah > saldoSaatIni) {

        alert("Saldo tidak mencukupi!");

        return;

    }

    // Menambahkan transaksi

    transaksi.unshift({

        keterangan: keterangan,
        jumlah: jumlah,
        jenis: jenis,
        tanggal: new Date().toLocaleDateString("id-ID")

    });

    // Menyimpan dan memperbarui data

    simpanData();

    tampilkanData();

    form.reset();

    alert("Transaksi berhasil disimpan!");

});


// 9. MENYIMPAN TARGET TABUNGAN

document
    .getElementById("simpanTarget")
    .addEventListener("click", function() {

        const nilaiTarget = Number(targetInput.value);

        if (
            !Number.isSafeInteger(nilaiTarget) ||
            nilaiTarget <= 0
        ) {

            alert("Masukkan target tabungan yang valid!");

            return;

        }

        target = nilaiTarget;

        localStorage.setItem("target", target);

        tampilkanData();

        alert("Target tabungan berhasil disimpan!");

    });


// 10. MENAMPILKAN DATA SAAT WEBSITE DIBUKA

targetInput.value = target || "";

tampilkanData();
