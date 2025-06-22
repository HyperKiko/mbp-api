import { Hono } from "hono";
import { apiCall } from "./apicall";
import { isValidInteger } from "./utils";
import { getUDID } from "./get_udid";

const app = new Hono<{ Bindings: CloudflareBindings }>();

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
            pagelimit: 999999999
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

    const data = await apiCall({
        module: "TV_downloadurl_v3",
        tid: id,
        season,
        episode,
        uid: c.env.MBP_TOKEN,
        open_udid: getUDID(c.env.MBP_TOKEN)
    });
    delete data.data.ip;
    delete data.data.hostname;

    return c.json(data);
});

app.get("/movie/:id", async (c) => {
    const id_str = c.req.param("id");
    if (!id_str || !isValidInteger(id_str))
        return c.json(
            { type: "error", message: "ID parameter needs to be a number." },
            400
        );
    const id = Number(id_str);

    const data = await apiCall({
        module: "Movie_downloadurl_v3",
        mid: id,
        uid: c.env.MBP_TOKEN,
        open_udid: getUDID(c.env.MBP_TOKEN)
    });
    delete data.data.ip;

    return c.json(data);
});

app.get("/movie/:id", async (c) => {});

export default app;
