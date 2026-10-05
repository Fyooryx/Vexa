# Vexa - Code Editor for Android

<p align="center">
  <img src='res/vexa_logo.png' width='250'>
</p>

[![GitHub Stars](https://img.shields.io/github/stars/Fyooryx/Vexa?style=flat)](https://github.com/Fyooryx/Vexa) [![](https://dcbadge.vercel.app/api/server/vVxVWYUAWD?style=flat)](https://discord.gg/vVxVWYUAWD)

## • Lineage

Vexa is a customized/rebranded build based on the upstream Acode open-source codebase. Original upstream attribution remains part of the repository.

## • Vexa 1.14.6 additions

- centralized Vexa identity metadata without conflating it with upstream service endpoints
- `Vexa 1.14.6` consolidates all icon-picker previews and Android launcher artwork on the supplied Vexa logo
- `Vexa: Copy Diagnostics` command for support reports
- Vexa and legacy `acode://` deep-link compatibility through one parser
- API credential routing derived from the configured service endpoint
- Vexa-branded startup/splash error messaging
- density-specific Vexa launcher assets across Android mipmap resources
- supplied Vexa logo is now the canonical launcher, splash, and in-app icon artwork
- legacy Android icon resource filenames were migrated from `ic_acode_*` to `ic_vexa_*`
- visible UI and localization branding was aligned from Acode to Vexa without changing compatibility identifiers
- automated branding guards now cover visible UI surfaces, localization values, and legacy resource filenames
- reproducible nightly builds remain protected by pinned GitHub Actions and Node.js 22

## • Vexa Advanced Developer Layer

PR #19 introduces an incremental Vexa-native developer layer without removing legacy compatibility contracts.

- Vexa Workspace Report for runtime and workspace state
- Vexa Health Check for runtime, editor, LSP, clipboard, and network capability checks
- Vexa Migration Status for the staged rebrand contract
- Vexa Capability Matrix for feature/runtime visibility
- Vexa Developer Context Pack for support/debugging reports
- Vexa Workspace Snapshot for metadata-only session export
- Vexa-first command and LSP naming while retaining compatibility aliases
- Vexa Runtime Profile: a read-only, metadata-only runtime/workspace health profile exposed to commands and plugins

Legacy identifiers are migrated only when a verified replacement exists. Deep links, storage identifiers, billing identifiers, upstream endpoints, and plugin compatibility surfaces may remain temporarily by design.
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

Rilis publik Play Store dan F-Droid belum tersedia; distribusi saat ini masih tahap pengembangan.

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
Isi kalo sudah ada Contributor


## • Developing a Plugin for Vexa

Untuk dokumentasi komprehensif tentang membuat plugin untuk Vexa Editor, kunjungi [repository] 
(https://github.com/Acode-Foundation/acode-plugin).

Untuk kompatibilitas API/plugin, gunakan dokumentasi upstream sebagai referensi(https://github.com/Acode-Foundation/acode-plugin)
