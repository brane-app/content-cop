import { FERRO_AUTH, FERRO_HOST } from "./env.ts";
import { Image } from "./deps.ts";

export class Ferrothorn {
  private static async request(id: string, opts: any = {}): Promise<Response> {
    return await fetch(
      `${FERRO_HOST}/${id}`,
      {
        headers: { "Authorization": FERRO_AUTH, ...(opts.headers || {}) },
        ...opts,
      },
    );
  }

  static async get(id: string): Promise<Image> {
    const response: Response = await this.request(id);
    if (response.status == 404) {
      response.body != null && await response.body?.cancel()
      throw new Error("not_found");
    }

    return await Image.decode(await (await response.blob()).arrayBuffer());
  }

  static async delete(id: string): Promise<Response> {
    return await this.request(id, { method: "DELETE" });
  }

  static async post(id: string, image: Image): Promise<Response> {
    const form: FormData = new FormData();
    form.append(
      "file",
      new Blob([(await image.encode(3)).buffer]),
      "file.png",
    );

    return await this.request(
      id,
      {
        method: "POST",
        body: form,
      },
    );
  }
}
