import { FERRO_AUTH, FERRO_HOST } from "./env.ts";
import { assertEquals, assertThrowsAsync, Image, v4 } from "./deps.ts";
import { Ferrothorn } from "./ferrothorn.ts";

const size: number = 100;
const name: string = v4.generate();
const form: FormData = new FormData();
form.append(
  "file",
  new Blob([(await (new Image(size, size)).encode(3)).buffer]),
);
await fetch(`${FERRO_HOST}/${name}`, { method: "POST", body: form });

function side(): number {
  return Math.trunc(100 + Math.random() * 4000);
}

Deno.test("get", async () => {
  const image: Image = await Ferrothorn.get(name);

  assertEquals(image.height, size);
  assertEquals(image.width, size);
});

Deno.test("post", async () => {
  const size: number = side();
  const name: string = v4.generate();
  await (await Ferrothorn.post(name, new Image(size, size))).body?.cancel();
  const fetched: Image = await Ferrothorn.get(name);

  assertEquals(fetched.height, size);
  assertEquals(fetched.width, size);
});

Deno.test("delete", async () => {
  const size: number = side();
  const name: string = v4.generate();
  await (await Ferrothorn.post(name, new Image(size, size))).body?.cancel();
  const fetched: Image = await Ferrothorn.get(name);

  assertEquals(fetched.height, size);
  assertEquals(fetched.width, size);

  await (await Ferrothorn.delete(name)).body?.cancel();
  await assertThrowsAsync(
    async () => { await Ferrothorn.get(name) }
  )
});
