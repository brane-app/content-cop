import { assert, assertEquals, assertNotEquals, v4 } from "./deps.ts";
import { Queue } from "./scyther.ts";
import { SCYTHER_HOST } from "./env.ts";

const name: string = "foobar";

async function delete_queue(id: string): Promise<void> {
  await fetch(`${SCYTHER_HOST}/queues/${id}`, { method: "DELETE" });
}

Deno.test("imports", async () => {
  assertNotEquals(Queue, undefined);
});

Deno.test("url", async () => {
  const url: string = (new Queue(name)).url;
  assertEquals(url, `${SCYTHER_HOST}/queues/${name}`);
});

Deno.test("new", async () => {
  const queue: Queue = await Queue.new();

  assertNotEquals(queue.url, null);
  assertNotEquals(queue.url, undefined);
  assertEquals(await queue.name, null);

  await delete_queue(await queue.id);
});

Deno.test("attaches", async () => {
  const name: string = v4.generate();
  await Queue.new({ name });
  const queue: Queue = new Queue(name);

  assertEquals(await queue.name, name);

  await delete_queue(name);
});

Deno.test("id", async () => {
  const queue: Queue = await Queue.new();
  const id: string = await queue.id;

  assert(v4.validate(id));

  await delete_queue(id);
});

Deno.test("name", async () => {
  const name: string = v4.generate();
  const queue: Queue = await Queue.new({ name });

  assertEquals(await queue.name, name);

  await delete_queue(name);
});

Deno.test("ephemeral", async () => {
  const queue: Queue = await Queue.new();

  assertEquals(await queue.ephemeral, false);

  await delete_queue(await queue.id);
});

Deno.test("capacity", async () => {
  const capacity: number = 100;
  const queue: Queue = await Queue.new();
  const queue_cap: Queue = await Queue.new({ capacity });

  assertEquals(await queue.capacity, null);
  assertEquals(await queue_cap.capacity, capacity);

  await delete_queue(await queue.id);
  await delete_queue(await queue_cap.id);
});

Deno.test("size", async () => {
  const queue: Queue = await Queue.new();

  assertEquals(await queue.size, 0);

  await queue.push("foobar");

  assertEquals(await queue.size, 1);

  await delete_queue(await queue.id);
});

Deno.test("head", async () => {
  const queue: Queue = await Queue.new();
  const message: string = v4.generate();
  await queue.push(message);
  await queue.push(v4.generate());

  assertEquals(await queue.head, message);
  assertNotEquals(await queue.head, message);

  await delete_queue(await queue.id);
});

Deno.test("head no_message", async () => {
  const queue: Queue = await Queue.new();

  await queue.head;
  assertEquals(await queue.head, null);

  await delete_queue(await queue.id);
});

Deno.test("tail", async () => {
  const queue: Queue = await Queue.new();
  const message: string = v4.generate();
  await queue.push(v4.generate());
  await queue.push(message);

  assertEquals(await queue.tail, message);
  assertNotEquals(await queue.tail, message);

  await delete_queue(await queue.id);
});

Deno.test("tail no_message", async () => {
  const queue: Queue = await Queue.new();

  assertEquals(await queue.tail, null);

  await delete_queue(await queue.id);
});

Deno.test("consume", async () => {
  const queue: Queue = await Queue.new();
  const message: string = v4.generate();
  await queue.push(v4.generate());
  await queue.push(message);
  await queue.push(v4.generate());

  assertEquals(await queue.consume(1), message);
  assertNotEquals(await queue.consume(1), message);

  await delete_queue(await queue.id);
});

Deno.test("consume no_message", async () => {
  const queue: Queue = await Queue.new();

  assertEquals(await queue.consume(1), null);

  await delete_queue(await queue.id);
});

Deno.test("peek", async () => {
  const queue: Queue = await Queue.new();
  const message: string = v4.generate();
  await queue.push(v4.generate());
  await queue.push(message);
  await queue.push(v4.generate());

  assertEquals(await queue.peek(1), message);
  assertEquals(await queue.peek(1), message);
  assertNotEquals(await queue.peek(0), message);

  await delete_queue(await queue.id);
});
