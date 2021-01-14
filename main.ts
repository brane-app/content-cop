import { get_image, post_image } from "./ferrothorn.ts";
import { Image } from "./deps.ts";
import { Queue } from "./scyther.ts";

const queue_name: string = Deno.env.get("SCYTHER_QUEUE") as string;
const target: number = 800;
const minute: number = 1000 * 60;

async function main() {
  const queue: Queue = new Queue(queue_name);

  while (true) {
    if (await queue.size === 0) {
      sleep(minute);
      continue;
    }

    let next: string = await queue.head as string;
    let image: Image | null = await get_image(next);
    if (image === null) {
      sleep(minute);
      continue;
    }

    await post_image(next, await targeted_scale(image as Image));
    console.log(`scaled ${next}`);
  }
}

function sleep(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function targeted_scale(image: Image): Promise<Image> {
  const factor: number = 1 / Math.min(
    image.height / target,
    image.width / target,
  );

  return 1 > factor ? image.clone().scale(factor) : image;
}

await main();
