import forge from "node-forge";

export async function apiCall(data: Record<string, any>): Promise<any> {
    data.expired_date = Math.floor(Date.now() / 1000) + 3600;

    const jsonStr = JSON.stringify(data);
    const dataBytes = forge.util.createBuffer(jsonStr, "utf8");

    const key = forge.util.hexToBytes("4a793339686c2134");
    const iv = forge.util.hexToBytes("7745697068546e21");

    const cipher = forge.cipher.createCipher("DES-CBC", key);
    cipher.start({ iv });
    cipher.update(dataBytes);
    cipher.finish();
    const encrypted = cipher.output;
    const ct = forge.util.encode64(encrypted.getBytes());

    const appkey = "moviebox";
    const md = forge.md.md5.create();
    md.update(appkey, "utf8");
    const ak = md.digest().toHex();

    const md2 = forge.md.md5.create();
    md2.update(ak + "Jy39hl!4" + ct, "utf8");
    const verify = md2.digest().toHex();

    const payload = {
        app_key: ak,
        encrypt_data: ct,
        verify
    };

    const encoded = btoa(JSON.stringify(payload));
    const url = `https://mbpapi.shegu.net/api/api_client/index?data=${encodeURIComponent(
        encoded
    )}&appid=28`;

    const res = await fetch(url);
    return res.json();
}
