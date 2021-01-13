import { Image } from "./deps.ts";

export const auth: string = Deno.env.get("FERROTHORN_AUTH") as string)
export const host: string = (Deno.env.get("FERROTHORN_HOST") as string).replace(
  /\/$/,
  "",
);

export async function get_image(id: string): Promise<Image> {
  const response: Response = await fetch(`${host}/`);
  return new Image(4, 4);
}
