// PMT - Author Dmitry Khorov
const fs = require("fs");
const path = require("path");

const AUTHOR_INFO = `

 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK

`;

function getFolderInfo(folderPath) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });

  const files = items.filter(item => item.isFile() && item.name !== "info.txt");
  const folders = items.filter(item => item.isDirectory());

  const fileDetails = files.map(file => {
    const filePath = path.join(folderPath, file.name);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    return `${file.name} - ${sizeKB} KB`;
  });

  const infoContent = [
    `Folder: ${path.basename(folderPath)}`,
    `Files: ${files.length}`,
    "",
    ...fileDetails,
    "",
    AUTHOR_INFO.trim(),
  ].join("\n");

  fs.writeFileSync(path.join(folderPath, "info.txt"), infoContent, "utf8");

  folders.forEach(subFolder => {
    getFolderInfo(path.join(folderPath, subFolder.name));
  });
}

const ROOT_DIR = process.cwd(); // текущая директория, где запущен скрипт
getFolderInfo(ROOT_DIR);

console.log("✅ info.txt успешно созданы во всех папках проекта!");

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/