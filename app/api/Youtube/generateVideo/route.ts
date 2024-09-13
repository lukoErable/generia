import { NextRequest, NextResponse } from 'next/server';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const writeJSON = (data: any) => {
    writer.write(encoder.encode(JSON.stringify(data) + '\n'));
  };

  try {
    const body = await request.json();
    const { desc } = body;

    const firstResponse = await fetch(
      'https://hailuoai.com/api/multimodal/generate/video?device_platform=web&app_id=3001&version_code=22201&uuid=f213e343-f8c1-4332-acd7-36297b0d1c65&device_id=290976098099191814&os_name=Mac&browser_name=chrome&device_memory=8&cpu_core_num=8&browser_language=fr-FR&browser_platform=MacIntel&screen_width=3440&screen_height=1440&unix=1726237242000',
      {
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6',
          'content-type': 'application/json',
          'sec-ch-ua':
            '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Mjk2ODYyNTMsInVzZXIiOnsiaWQiOiIyOTA5NzYwOTk5OTkyMTU2MTYiLCJuYW1lIjoi5bCP6J665bi9NTYxNiIsImF2YXRhciI6Imh0dHBzOi8vY2RuLnlpbmdzaGktYWkuY29tL3Byb2QvdXNlcl9hdmF0YXIvMTcwNjI2NzU5ODg3NTg5OTk1My0xNzMxOTQ1NzA2Njg5NjU4OTZvdmVyc2l6ZS5wbmciLCJkZXZpY2VJRCI6IjI5MDk3NjA5ODA5OTE5MTgxNCIsImlzQW5vbnltb3VzIjp0cnVlfX0.i4NiNzWntR_sXhZQqmWeBpwUayWx02F4cIS4TfoNZ-w',
        },
        body: JSON.stringify({ desc }),
      }
    );

    if (!firstResponse.ok) {
      throw new Error(`HTTP error! status: ${firstResponse.status}`);
    }

    const firstData = await firstResponse.json();
    console.log('First API Response:', firstData);

    const videoId = firstData.data.id;

    let secondData;
    let percent = 0;
    let queuePosition = null;

    while (percent < 100) {
      const secondResponse = await fetch(
        `https://hailuoai.com/api/multimodal/video/processing?idList=${videoId}&device_platform=web&app_id=3001&version_code=22201&uuid=f213e343-f8c1-4332-acd7-36297b0d1c65&device_id=290976098099191814&os_name=Mac&browser_name=chrome&device_memory=8&cpu_core_num=8&browser_language=fr-FR&browser_platform=MacIntel&screen_width=3440&screen_height=1440&unix=1726243764000`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6',
            'content-type': 'application/json',
            'sec-ch-ua':
              '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Mjk2ODYyNTMsInVzZXIiOnsiaWQiOiIyOTA5NzYwOTk5OTkyMTU2MTYiLCJuYW1lIjoi5bCP6J665bi9NTYxNiIsImF2YXRhciI6Imh0dHBzOi8vY2RuLnlpbmdzaGktYWkuY29tL3Byb2QvdXNlcl9hdmF0YXIvMTcwNjI2NzU5ODg3NTg5OTk1My0xNzMxOTQ1NzA2Njg5NjU4OTZvdmVyc2l6ZS5wbmciLCJkZXZpY2VJRCI6IjI5MDk3NjA5ODA5OTE5MTgxNCIsImlzQW5vbnltb3VzIjp0cnVlfX0.i4NiNzWntR_sXhZQqmWeBpwUayWx02F4cIS4TfoNZ-w',
          },
        }
      );

      if (!secondResponse.ok) {
        throw new Error(`HTTP error! status: ${secondResponse.status}`);
      }

      secondData = await secondResponse.json();
      console.log('Second API Response:', secondData.data.videos);

      const videoData = secondData.data.videos[0];
      percent = videoData.percent;

      const match = videoData.message.match(/^前面还有(\d+)位/);
      if (match) {
        queuePosition = parseInt(match[1], 10);
        console.log(queuePosition);
      } else {
        queuePosition = null;
      }

      // Send progress update to client
      writeJSON({ status: 'progress', percent, queuePosition });

      if (percent < 100) {
        await delay(3000); // Wait for 3 seconds before the next request
      }
    }

    // Extract coverURL and videoURL
    const { coverURL, videoURL } = secondData.data.videos[0];

    // Send final update to client
    writeJSON({ status: 'complete', coverURL, videoURL });

    writer.close();
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    writeJSON({
      status: 'error',
      message: 'An error occurred while processing your request',
    });
    writer.close();
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }
}
