# Vexa - Code Editor for Android

<p align="center">
  <img src='res/logo_1.png' width='250'>
</p>

[![GitHub Stars](https://img.shields.io/github/stars/Fyooryx/Vexa?style=flat)](https://github.com/Fyooryx/Vexa) [![](https://dcbadge.vercel.app/api/server/vVxVWYUAWD?style=flat)](https://discord.gg/vVxVWYUAWD)

## • Lineage

Vexa is a customized/rebranded build based on the upstream Acode open-source codebase. Original upstream attribution remains part of the repository.

## • Overview

Selamat datang di Vexa Editor - alat pengeditan kode yang kuat dan serbaguna yang dirancang khusus untuk perangkat Android. Apakah Anda sedang mengerjakan HTML, CSS, JavaScript, atau bahasa pemrograman lainnya, Vexa memberdayakan Anda untuk mengkode di mana saja dengan percaya diri. 

## • Features

- Mengedit dan membuat situs web, lalu langsung pratinjau di browser. 
- Modifikasi file sumber untuk berbagai bahasa seperti Python, Java, JavaScript, dan lainnya secara mulus. 
- Konsol javascript bawaan
- Integrasi terminal S/FTP dan SSH
- Terminal bawaan (Alpine)
- Nikmati dukungan pengeditan multibahasa dengan alat manajemen yang mudah. 
- Nikmati koleksi besar plugin komunitas untuk meningkatkan pengalaman coding Anda. 

## • Installation

Anda dapat mendapatkan Vexa Editor dari platform populer: 

Link playstore isi nanti belum diupload/tahap pengembangan
Link F-droid isi nanti belum diupload/tahap pengembangan

## • Project Structure

<pre>
Vexa/
|
|- src/   - Core code and language files
|
|- www/   - Public documents, compiled files, and HTML templates
|
|- utils/ - CLI tools for building, string manipulation, and more
|
|- codemirror-lsp-client/ - Git submodule providing @codemirror/lsp-client (clone with --recurse-submodules)
</pre>

## • Multi-language Support

Tingkatkan kemampuan Vexa dengan menambahkan bahasa baru dengan mudah. Cukup buat file dengan kode bahasa (misalnya, en-us untuk bahasa Inggris) di ['src/lang/'](https://github.com/Fyooryx/Vexa/tree/main/src/lang) dan sertakan di ['src/lib/lang.js'](https://github.com/Fyooryx/Vexa/blob/main/src/lib/lang.js). Kelola string lintas bahasa dengan mudah menggunakan perintah utilitas: 

```shell
pnpm run lang add
pnpm run lang remove
pnpm run lang search
pnpm run lang update
```

## • Contributing & Building the Application

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## • Contributors
Isi kalo sudah ada Contributor


## • Developing a Plugin for Vexa

Untuk dokumentasi komprehensif tentang membuat plugin untuk Vexa Editor, kunjungi [repository] 
(https://github.com/Acode-Foundation/acode-plugin).

For plugin development information, refer to: [upstream plugin documentation](https://github.com/Acode-Foundation/acode-plugin)
