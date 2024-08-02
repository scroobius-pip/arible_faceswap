/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
    async fetch(request, env, ctx) {
        const authHeader = request.headers.get('Authorization');
        const expectedAuth = env.ARIBLE_APP_AUTH;

        // Check if the Authorization header matches the expected value
        if (authHeader !== expectedAuth) {
            return new Response('Unauthorized', { status: 401 });
        }

        const FAL_KEY = env.FAL_KEY

        const body = await request.json();

        const response = await (await fetch('https://fal.run/fal-ai/face-swap', {
            method: 'POST',
            body: JSON.stringify({
                base_image_url: body.base_image[0],
                swap_image_url: body.swap_image[0]
            }),
            headers: {
                Authorization: `Key ${FAL_KEY}`,
                'Content-Type': 'application/json'
            }
        })).json()

        const image_url = response["image"]["url"];

        const ablResponse = {
            fields: [
                {
                    "name": "swapped_image",
                    "title": "Here's your swapped face",
                    "type": "Image",
                    "value": image_url
                },
                {
                    "name": "swapped_image_file",
                    "title": "Download",
                    "type": "FileOutput",
                    "value": [{
                        "name": `${body['user_id'] ?? 'arible'}_swapped.jpeg`,
                        "content": "{{swapped_image}}"
                    }]
                }
            ]
        }

        return new Response(JSON.stringify(ablResponse), {
            headers: {
                'Content-Type': 'application/json'
            }
        })

    },
};