const fs = require("fs");
const path = require("path");
const { OrgStructure, News, Product, Gallery } = require("./models");

async function cleanUpOrphanFiles() {
  console.log("Mulai membersihkan file sampah...");

  // 1. Baca semua file yang ada di folder uploads
  const uploadDir = path.join(__dirname, "uploads");
  const filesInDir = fs.readdirSync(uploadDir);

  // 2. Ambil semua path gambar dari database (menyesuaikan kolom thumbnail)
  const [orgs, news, prods, gals] = await Promise.all([
    OrgStructure.findAll({ attributes: ["photo"] }),
    News.findAll({ attributes: ["thumbnail"] }), // <-- Diubah jadi thumbnail
    Product.findAll({ attributes: ["image"] }),
    Gallery.findAll({ attributes: ["image"] }),
  ]);

  // Kumpulkan semua nama file yang MASIH DIPAKAI ke dalam satu array
  const usedFiles = [
    ...orgs.map((i) => i.photo),
    ...news.map((i) => i.thumbnail), // <-- Diubah jadi thumbnail
    ...prods.map((i) => i.image),
    ...gals.map((i) => i.image),
  ]
    .map((url) => (url ? url.split("/").pop() : null))
    .filter(Boolean);

  let deletedCount = 0;

  // 3. Bandingkan dan hapus file yang tidak terdaftar di database
  filesInDir.forEach((filename) => {
    if (filename === ".gitkeep") return;

    if (!usedFiles.includes(filename)) {
      fs.unlinkSync(path.join(uploadDir, filename));
      console.log(`🗑️ Menghapus file sampah: ${filename}`);
      deletedCount++;
    }
  });

  console.log(`✅ Selesai! Berhasil menghapus ${deletedCount} file sampah.`);
  process.exit();
}

cleanUpOrphanFiles();
