import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessage = messages[messages.length - 1]?.content || "Hello";

    // Generate a session ID on each chat continuation
    const session_id = crypto.randomUUID();

    // Prepare API request
    const response = await fetch(
      "https://workflow.sandbox.kayatech.ai/api/v1/workflows/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "kaya_1c0ffb0cc72bb3eee3600d5fcdc396965af42c985d90f8a622cc26dd4b10ea35",
        },
        body: JSON.stringify({
          message: userMessage,
          workflow_id: "db6aef8d-49ce-47ec-99f0-c8c9569035d3",
          session_id, // new session per conversation
          variables: {},
          is_stream: true,
          auth_type: "API_KEY",
        }),
      }
    );

    // Streaming response
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();

    if (!reader) {
      return NextResponse.json(
        { error: "No streaming reader returned" },
        { status: 500 }
      );
    }

    // Stream to client
    return new Response(
      new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(value); // Pass chunks directly
          }
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      }
    );
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong in workflow API" },
      { status: 500 }
    );
  }
}
