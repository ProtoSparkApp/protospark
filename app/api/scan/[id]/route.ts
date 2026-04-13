import { NextResponse } from "next/server";
import { getScanSession } from "@/lib/actions/scan";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      let active = true;
      let lastStatus = "";

      request.signal.addEventListener("abort", () => {
        active = false;
      });

      while (active) {
        const res = await getScanSession(id);

        if (res.error) {
          active = false;
          controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${res.error}\n\n`));
          controller.close();
          break;
        }

        if (res.data && res.data.status !== lastStatus) {
          lastStatus = res.data.status;
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(res.data)}\n\n`));

          if (res.data.status === 'completed' || res.data.status === 'failed') {
            active = false;
            controller.close();
            break;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
