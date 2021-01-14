import { FERRO_AUTH, FERRO_HOST } from "./env.ts";
import { Image } from "./deps.ts";

export async function get_image(id: string): Promise<Image | null> {
  const response: Response = await fetch(`${FERRO_HOST}/${id}`);
  if (response.status == 404) {
    return null;
  }

  return await Image.decode(await (await response.blob()).arrayBuffer());
}

export async function post_image(id: string, image: Image): Promise<Response> {
  const form: FormData = new FormData();
  form.append("file", new Blob([(await image.encode(3)).buffer]), "file.png");

  return await fetch(
    `${FERRO_HOST}/${id}`,
    { method: "POST", body: form },
  );
}
