# Languages

UI, source labels, errors and installation guides cover the 51 locales listed in [Stremio's translation registry](https://github.com/Stremio/stremio-translations/blob/b48c39cf233afea4dea2d562494a9936cf05ae12/index.js), checked on 2026-10-06. This list describes interface translations, not every possible audio or subtitle language.

| Language | Guide | Code |
| --- | --- | --- |
| العربية | [العربية](guides/ar-AR.md) | `ar-AR` |
| Беларуская | [Беларуская](guides/be-BY.md) | `be-BY` |
| Български | [Български](guides/bg-BG.md) | `bg-BG` |
| বাংলা | [বাংলা](guides/bn-BD.md) | `bn-BD` |
| Català | [Català](guides/ca-ES.md) | `ca-ES` |
| Čeština | [Čeština](guides/cs-CZ.md) | `cs-CZ` |
| Dansk | [Dansk](guides/da-DK.md) | `da-DK` |
| Deutsch | [Deutsch](guides/de-DE.md) | `de-DE` |
| Ελληνικά | [Ελληνικά](guides/el-GR.md) | `el-GR` |
| English | [English](guides/en-US.md) | `en-US` |
| Esperanto | [Esperanto](guides/eo-EO.md) | `eo-EO` |
| Español | [Español](guides/es-ES.md) | `es-ES` |
| Eesti | [Eesti](guides/et-EE.md) | `et-EE` |
| Euskara | [Euskara](guides/eu-ES.md) | `eu-ES` |
| فارسی | [فارسی](guides/fa-IR.md) | `fa-IR` |
| Suomi | [Suomi](guides/fi-FI.md) | `fi-FI` |
| Français | [Français](guides/fr-FR.md) | `fr-FR` |
| עברית | [עברית](guides/he-IL.md) | `he-IL` |
| हिन्दी | [हिन्दी](guides/hi-IN.md) | `hi-IN` |
| Hrvatski | [Hrvatski](guides/hr-HR.md) | `hr-HR` |
| Magyar | [Magyar](guides/hu-HU.md) | `hu-HU` |
| Bahasa Indonesia | [Bahasa Indonesia](guides/id-ID.md) | `id-ID` |
| Italiano | [Italiano](guides/it-IT.md) | `it-IT` |
| 日本語 | [日本語](guides/ja-JP.md) | `ja-JP` |
| 한국어 | [한국어](guides/ko-KR.md) | `ko-KR` |
| Lietuvių | [Lietuvių](guides/lt-LT.md) | `lt-LT` |
| Македонски | [Македонски](guides/mk-MK.md) | `mk-MK` |
| မြန်မာ | [မြန်မာ](guides/my-BM.md) | `my-BM` |
| Norsk bokmål | [Norsk bokmål](guides/nb-NO.md) | `nb-NO` |
| नेपाली | [नेपाली](guides/ne-NP.md) | `ne-NP` |
| Nederlands | [Nederlands](guides/nl-NL.md) | `nl-NL` |
| Norsk nynorsk | [Norsk nynorsk](guides/nn-NO.md) | `nn-NO` |
| ਪੰਜਾਬੀ | [ਪੰਜਾਬੀ](guides/pa-IN.md) | `pa-IN` |
| Polski | [Polski](guides/pl-PL.md) | `pl-PL` |
| Português (Brasil) | [Português (Brasil)](guides/pt-BR.md) | `pt-BR` |
| Português (Portugal) | [Português (Portugal)](guides/pt-PT.md) | `pt-PT` |
| Română | [Română](guides/ro-RO.md) | `ro-RO` |
| Русский | [Русский](guides/ru-RU.md) | `ru-RU` |
| Slovenčina | [Slovenčina](guides/sk-SK.md) | `sk-SK` |
| Slovenščina | [Slovenščina](guides/sl-SL.md) | `sl-SL` |
| Српски | [Српски](guides/sr-RS.md) | `sr-RS` |
| Svenska | [Svenska](guides/sv-SE.md) | `sv-SE` |
| தமிழ் | [தமிழ்](guides/ta-IN.md) | `ta-IN` |
| తెలుగు | [తెలుగు](guides/te-IN.md) | `te-IN` |
| Türkçe | [Türkçe](guides/tr-TR.md) | `tr-TR` |
| Українська | [Українська](guides/uk-UA.md) | `uk-UA` |
| اردو | [اردو](guides/ur-PK.md) | `ur-PK` |
| Tiếng Việt | [Tiếng Việt](guides/vi-VN.md) | `vi-VN` |
| 简体中文 | [简体中文](guides/zh-CN.md) | `zh-CN` |
| 繁體中文（香港） | [繁體中文（香港）](guides/zh-HK.md) | `zh-HK` |
| 繁體中文（台灣） | [繁體中文（台灣）](guides/zh-TW.md) | `zh-TW` |

Choose a language on the local dashboard before installing. Localized manifest paths are `/<private-token>/<locale>/manifest.json`; the original path uses `config.json`'s `language` setting. Translations cover this addon only; upstream addon titles and filenames retain their original text. Right-to-left layout is enabled for Arabic, Persian, Hebrew and Urdu.

Edit `locales/<code>.json`, run `npm run check:locales` and `npm run build:docs`, and include the generated guide and portal data in your pull request. Native-speaker corrections are welcome.
