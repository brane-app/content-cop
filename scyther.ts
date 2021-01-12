interface queue_body {
    id: string,
    name: string,
    ephemeral: boolean,
    capacity: number,
    size: number,
}

interface queue_create {
    id: string,
    error: string,
}

interface queue_message {
    message: string,
}

export class Queue {
    url: string

    constructor(api: string, reference: string) {
        this.url = `${api}/queues/${reference}`
    }

    get body(): Promise<queue_body> {
        return ( async () => { return (await this.request("/")).queue } )()
    }

    static async new(api: string, name?: string, capacity?: number): Promise<Queue> {
        const response: Response = await fetch(
            `${api}/queues`,
            { method: "POST", body: JSON.stringify({ name, capacity }) },
        )

        const body: queue_create = await response.json()

        if ( response.status == 200 ) {
            return new Queue(api, body.id)
        }

        throw body.error
    }

    async request(path: string, opts: any = {}): Promise<any> {
        const response: Response = await fetch(`${this.url}${path}`, opts)

        const body: any = await response.status == 200 ? await response.json() : {}
        if ( 400 <= response.status ) {
            throw body.error
        }

        return body
    }

    async push(message: string): Promise<void> {
        await this.request("", { method: "PUT", body: message })
    }

    private async safe_message(reference: string): Promise<string | void> {
        try {
            return (await this.request(reference)).message
        } catch (thrown) {
            if (thrown == "no_message") {
                return
            }

            throw thrown
        }
    }

    async head(): Promise<string | void> {
        return await this.safe_message("/head")
    }

    async tail(): Promise<string | void> {
        return await this.safe_message("/tail")
    }

    async consume(index: number): Promise<string | void> {
        return await this.safe_message(`/consume/${index}`)
    }

    async peek(index: number): Promise<string | void> {
        return await this.safe_message(`/peek/${index}`)
    }
}
