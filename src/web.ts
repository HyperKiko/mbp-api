import * as cheerio from "cheerio";

export const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";

export default async function scrapeHTML(
    html: string,
    token: string
): Promise<any> {
    const startTime = Date.now();
    const $ = cheerio.load(html);

    const list = (
        await Promise.all(
            $("[oss_download_url]")
                .map((_, el) => {
                    const url = new URL(
                        `https://www.movieboxpro.app${el.attribs.oss_download_url}`
                    );
                    const cheerioEl = $(el);
                    const secondEl = $(cheerioEl.find("> div")[1]);
                    return fetch(url, {
                        headers: {
                            "User-Agent": USER_AGENT,
                            Cookie: `ui=${token}`
                        }
                    })
                        .then((res) => res.text())
                        .then((text) =>
                            (
                                JSON.parse(
                                    /^[ |\t]*var qualityLevels = (.*?);$/m.exec(
                                        text
                                    )?.[1] || "[]"
                                ) as any[]
                            ).map((stream) =>
                                stream.sources.map((source: any) => ({
                                    ...Object.fromEntries(
                                        Array.from(url.searchParams).map(
                                            ([key, value]) => [
                                                key,
                                                Number(value)
                                            ]
                                        )
                                    ),
                                    bitstream: cheerioEl
                                        .find(".speed > span")
                                        .text()
                                        .trim(),
                                    quality: stream.name.replace(" HDR", ""),
                                    real_quality: stream.name.replace(
                                        " HDR",
                                        ""
                                    ),
                                    mmfid: Number(
                                        new URLSearchParams(
                                            el.attribs.app_url
                                        ).get("mp4_id")
                                    ),
                                    filename: secondEl
                                        .find("> span")
                                        .text()
                                        .trim(),
                                    dateline: Math.floor(
                                        new Date(
                                            secondEl
                                                .find("> p > span")
                                                .first()
                                                .text()
                                                .trim()
                                        ).getTime() / 1000
                                    ),
                                    size: $(secondEl.find("> p > span")[1])
                                        .text()
                                        .trim(),
                                    original: 0,
                                    hdr: Number(stream.name.endsWith(" HDR")),
                                    path:
                                        source.src !==
                                        "/static/video/vip_only.mp4"
                                            ? source.src
                                            : "",
                                    format: source.type.split("/")[1],
                                    mp4_id: source.mp4_id
                                }))
                            )
                        );
                })
                .toArray()
        )
    ).flat(2);

    return {
        code: 1,
        message: "success",
        data: {
            seconds: Math.floor((Date.now() - startTime) / 1000),
            quality: list.map((item) => item.real_quality),
            list
        }
    };
}
