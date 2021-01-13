interface queue_data {
  id: string;
  name: string;
  ephemeral: boolean;
  capacity: number;
  size: number;
}

interface queue_new_opts {
  name?: string;
  capacity?: number;
}

interface queue_create {
  id: string;
  error: string;
}

interface queue_message {
  message: string;
}

export class Queue {
  url: string;

  constructor(api: string, reference: string) {
    this.url = `${api}/queues/${reference}`;
  }

  private get data(): Promise<queue_data> {
    return (async () => {
      return (await this.request("/")).queue;
    })();
  }

  get id(): Promise<string> {
    return (async () => (await this.data).id)();
  }

  get name(): Promise<string> {
    return (async () => (await this.data).name)();
  }

  get ephemeral(): Promise<boolean> {
    return (async () => (await this.data).ephemeral)();
  }

  get capacity(): Promise<number> {
    return (async () => (await this.data).capacity)();
  }

  get size(): Promise<number> {
    return (async () => (await this.data).size)();
  }

  static async new(api: string, opts: queue_new_opts = {}): Promise<Queue> {
    const response: Response = await fetch(
      `${api}/queues`,
      {
        method: "POST",
        body: JSON.stringify({ name: opts.name, capacity: opts.capacity }),
      },
    );

    const body: queue_create = await response.json();

    if (response.status == 200) {
      return new Queue(api, body.id);
    }

    throw body.error;
  }

  private async request(path: string, opts: any = {}): Promise<any> {
    const response: Response = await fetch(`${this.url}${path}`, opts);
    const body: any = await response.status == 204 ? {} : await response.json();

    if (400 <= response.status) {
      throw body.error;
    }

    return body;
  }

  async push(message: string): Promise<void> {
    await this.request("", { method: "PUT", body: message });
  }

  private async safe_message(reference: string): Promise<string | null> {
    try {
      return (await this.request(reference)).message;
    } catch (thrown) {
      if (thrown == "no_message") {
        return null;
      }

      throw thrown;
    }
  }

  get head(): Promise<string | null> {
    return (async () => await this.safe_message("/head"))();
  }

  get tail(): Promise<string | null> {
    return (async () => await this.safe_message("/tail"))();
  }

  async consume(index: number): Promise<string | null> {
    return await this.safe_message(`/consume/${index}`);
  }

  async peek(index: number): Promise<string | null> {
    return await this.safe_message(`/peek/${index}`);
  }
}
