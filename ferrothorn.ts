import { Image } from "./deps.ts";

const auth: string = Deno.env.get("FERROTHORN_AUTH") as string;
const host: string = (Deno.env.get("FERROTHORN_HOST") as string).replace(
  /\/$/,
  "",
);

export async function get_image(id: string): Promise<Image | null> {
  const response: Response = await fetch(`${host}/${id}`);
  if (response.status == 404) {
    return null;
  }

  return await Image.decode(await (await response.blob()).arrayBuffer());
}

export async function post_image(id: string, image: Image): Promise<Response> {
  const form: FormData = new FormData();
  form.append("file", new Blob([(await image.encode(3)).buffer]), "file.png");

  return await fetch(`${host}/${id}`, { method: "POST", body: form });
}
