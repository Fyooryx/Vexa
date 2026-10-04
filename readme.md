# Vexa - Code Editor for Android

<p align="center">
  <img src='res/logo_1.png' width='250'>
</p>

[![GitHub Stars](https://img.shields.io/github/stars/Fyooryx/Vexa?style=flat)](https://github.com/Fyooryx/Vexa) [![](https://dcbadge.vercel.app/api/server/vVxVWYUAWD?style=flat)](https://discord.gg/vVxVWYUAWD)

## • Lineage

Vexa is a customized/rebranded build based on the upstream Acode open-source codebase. Original upstream attribution remains part of the repository.

## • Vexa 1.14.3 additions

- centralized Vexa identity metadata without conflating it with upstream service endpoints
- `Vexa: Copy Diagnostics` command for support reports
- `vexa://` authentication/deep-link support with legacy `acode://` compatibility
- density-specific Vexa launcher assets across Android mipmap resources
- responsive CodeMirror measurement fixes for fullscreen/editor resizing
- hardened AdMob base fallback behavior
- automated branding, type-safety, test, and workflow supply-chain checks in CI
- reproducible nightly builds with pinned GitHub Actions and Node.js 22

## • Overview

Selamat datang di Vexa Editor — alat pengeditan kode yang kuat dan serbaguna yang dirancang khusus untuk perangkat Android. Apakah Anda sedang mengerjakan HTML, CSS, JavaScript, atau bahasa pemrograman lainnya, Vexa memberdayakan Anda untuk mengkode di mana saja dengan percaya diri. 

## • Features

- Mengedit dan membuat situs web, lalu langsung pratinjau di browser. 
- Modifikasi file sumber untuk berbagai bahasa seperti Python, Java, JavaScript, dan lainnya secara mulus. 
- Konsol javascript bawaan
- Integrasi terminal S/FTP dan SSH
- Terminal bawaan (Alpine)
- Nikmati dukungan pengeditan multibahasa dengan alat manajemen yang mudah. 
- Nikmati koleksi besar plugin komunitas untuk meningkatkan pengalaman coding Anda. 

## • Installation

Vexa saat ini masih dalam tahap pengembangan. Distribusi publik Play Store dan F-Droid belum tersedia.

Untuk build lokal, ikuti panduan di `CONTRIBUTING.md` dan jalankan gate berikut sebelum membangun APK:

```bash
npm ci
npm run check:vexa
npm run build paid dev apk
```

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
npm run lang add
npm run lang remove
npm run lang search
npm run lang update
```

## • Development Validation

Before submitting changes, run the same validation gate used by Vexa CI:

```shell
npm ci
npm run check:vexa
```

This checks Vexa identity/branding, immutable GitHub Actions, TypeScript, and unit tests.

## • Contributing & Building the Application

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## • Contributors
Lihat daftar kontributor di tab Contributors repository GitHub Vexa.


## • Developing a Plugin for Vexa

Untuk dokumentasi komprehensif tentang membuat plugin untuk Vexa Editor, kunjungi [repository] 
(https://github.com/Acode-Foundation/acode-plugin).

Untuk kompatibilitas API/plugin, gunakan dokumentasi upstream sebagai referensi(https://github.com/Acode-Foundation/acode-plugin)
