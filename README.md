[![make.fun · news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/gemblongjos3-cmyk/news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/gemblongjos3-cmyk/news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

# 25 November 2026 in one image

This is my entry for the [make.fun news-image-20261125 bounty](https://make.fun/bounty/news-image-20261125),
which asks for a single image that sums up the world news of 25 November 2026.

The image is a broadsheet front page: **THE DAILY LEDGER**, dated Wednesday 25 November
2026, with the headline **"KYIV SINKS RUSSIAN WARSHIP"**. It gathers the day's maritime war
stories onto one front page, the way a print editor would have set them:

- President Zelenskiy confirms Ukraine's drone attack on a Russian cargo ship in the Gulf of Finland.
- A second Russian vessel is hit off Libya, and a warship is sunk in Benghazi harbour.
- Norway urges caution as the war reaches new waters.

The point of the front-page framing is that these are not separate stories. Read together,
they describe a conflict that has moved out of the Black Sea and onto the open sea lanes,
from the Baltic approaches to the North African coast, with a neutral shipping nation
already asking its vessels to be careful.

## Running it

`main.ts` needs nothing but Node — no dependencies, no build step, no network.

```sh
node main.ts
```

It reads `entry.png` from beside the script, walks the JPEG marker segments to confirm the
file is a real 1024×1024 JPEG, then writes the bytes unchanged into the output directory.
Set `MAKEFUN_OUTPUT_DIR` to choose that directory; it defaults to `/output`.

On success it prints one line:

```
entry.png: 1024x1024 jpeg, 307285 bytes, sha256 018e588b...
```

On any problem — a missing file, a broken SOI/EOI marker, a frame that is not 1024×1024 —
it prints an error to stderr and exits 1.

## License

MIT — see [LICENSE](LICENSE).
