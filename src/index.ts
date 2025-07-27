import { Hono } from "hono";
import { apiCall } from "./apicall";
import { isValidInteger } from "./utils";
import { getUDID } from "./get_udid";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", (c, next) =>
    cors({ origin: c.env.CORS_ORIGINS.split(",") })(c, next)
);

app.get("/search", async (c) => {
    const query = c.req.query("q");
    const year = c.req.query("year");
    const type = c.req.query("type");
    if (query === undefined)
        return c.json(
            { type: "error", message: "Query parameter 'q' is required." },
            400
        );
    if (type !== undefined && !["movie", "tv"].includes(type))
        return c.json(
            {
                type: "error",
                message: `Invalid type parameter ${type}. Use 'movie' or 'tv'.`
            },
            400
        );

    return c.json(
        await apiCall({
            module: "Search5",
            keyword: query,
            year: year || "",
            type: type || "all",
            page: 1,
            pagelimit: 999999999,
            private_mode: 1
        })
    );
});

app.get("/details/tv/:id", async (c) => {
    const id_str = c.req.param("id");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    const id = Number(id_str);
    return c.json(
        await apiCall({
            module: "TV_detail_v2",
            tid: id
        })
    );
});

app.get("/details/movie/:id", async (c) => {
    const id_str = c.req.param("id");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    const id = Number(id_str);
    return c.json(
        await apiCall({
            module: "Movie_detail",
            mid: id
        })
    );
});

app.get("/tv/:id/:season/:episode", async (c) => {
    const id_str = c.req.param("id");
    const season_str = c.req.param("season");
    const episode_str = c.req.param("episode");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    if (!season_str || !isValidInteger(season_str))
        return c.json(
            {
                type: "error",
                message: "Season parameter needs to be a number."
            },
            400
        );
    if (!episode_str || !isValidInteger(episode_str))
        return c.json(
            {
                type: "error",
                message: "Episode parameter needs to be a number."
            },
            400
        );
    const id = Number(id_str);
    const season = Number(season_str);
    const episode = Number(episode_str);

    return c.json(
        await apiCall({
            module: "TV_downloadurl_v3",
            tid: id,
            season,
            episode,
            uid: c.env.MBP_TOKEN,
            open_udid: getUDID(c.env.MBP_TOKEN)
        })
    );
});

app.get("/movie/:id", async (c) => {
    const id_str = c.req.param("id");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    const id = Number(id_str);

    return c.json(
        await apiCall({
            module: "Movie_downloadurl_v3",
            mid: id,
            uid: c.env.MBP_TOKEN,
            open_udid: getUDID(c.env.MBP_TOKEN)
        })
    );
});

app.get("/subtitles/tv/:id/:season/:episode/:stream", async (c) => {
    const id_str = c.req.param("id");
    const season_str = c.req.param("season");
    const episode_str = c.req.param("episode");
    const stream_str = c.req.param("stream");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    if (!season_str || !isValidInteger(season_str))
        return c.json(
            {
                type: "error",
                message: "Season parameter needs to be a number."
            },
            400
        );
    if (!episode_str || !isValidInteger(episode_str))
        return c.json(
            {
                type: "error",
                message: "Episode parameter needs to be a number."
            },
            400
        );
    if (!stream_str || !isValidInteger(stream_str))
        return c.json(
            {
                type: "error",
                message: "Stream parameter needs to be a number."
            },
            400
        );
    const id = Number(id_str);
    const season = Number(season_str);
    const episode = Number(episode_str);
    const stream = Number(stream_str);

    return c.json(
        await apiCall({
            module: "TV_srt_list_v3",
            tid: id,
            season,
            episode,
            uid: c.env.MBP_TOKEN,
            fid: stream,
            lang: "en",
            open_udid: getUDID(c.env.MBP_TOKEN)
        })
    );
});

app.get("/subtitles/movie/:id/:stream", async (c) => {
    const id_str = c.req.param("id");
    const stream_str = c.req.param("stream");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    if (!stream_str || !isValidInteger(stream_str))
        return c.json(
            {
                type: "error",
                message: "Stream parameter needs to be a number."
            },
            400
        );
    const id = Number(id_str);
    const stream = Number(stream_str);
    return c.json(
        await apiCall({
            module: "Movie_srt_list_v3",
            mid: id,
            uid: c.env.MBP_TOKEN,
            fid: stream,
            lang: "en",
            open_udid: getUDID(c.env.MBP_TOKEN)
        })
    );
});

export default app;
