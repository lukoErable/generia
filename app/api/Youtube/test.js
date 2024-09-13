const fetch = require('node-fetch');

async function generateAndCheckVideo() {
  const baseUrl = 'https://hailuoai.com/api/multimodal';
  const commonParams =
    'device_platform=web&app_id=3001&version_code=22201&uuid=4d7046ca-3b57-4097-8cdd-98287c4d4ce7&device_id=289712212800757760&os_name=Windows&browser_name=chrome&device_memory=8&cpu_core_num=12&browser_language=fr-FR&browser_platform=Win32&screen_width=1920&screen_height=1080';

  const headers = {
    baggage:
      'sentry-environment=production,sentry-release=vNiXnO9R7RJf9JXK4DX3d,sentry-public_key=6cf106db5c7b7262eae7cc6b411c776a,sentry-trace_id=d2d713e59bde43ea8f66529e79cc5f2f,sentry-sample_rate=1,sentry-sampled=true',
    'content-type': 'application/json',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjkzODQ5MTksInVzZXIiOnsiaWQiOiIyODk3MTIyMTM1MTM4MDE3MjkiLCJuYW1lIjoi5bCP6J665bi9MTcyOSIsImF2YXRhciI6Imh0dHBzOi8vY2RuLnlpbmdzaGktYWkuY29tL3Byb2QvdXNlcl9hdmF0YXIvMTcwNjI2NzU0NDM4OTgyMDgwMS0xNzMxOTQ1NzA2Njg5NjU4OTZvdmVyc2l6ZS5wbmciLCJkZXZpY2VJRCI6IjI4OTcxMjIxMjgwMDc1Nzc2MCIsImlzQW5vbnltb3VzIjp0cnVlfX0.XcI1Hng-ceMQYJ7vQI93sh-TUQBKEUbpSLGaCgDrKsI',
    yy: 'edb7ee467c628ea4b0195d2ce6b4ba34',
  };

  try {
    // Step 1: Generate video
    const generateUrl = `${baseUrl}/generate/video?${commonParams}&unix=${Date.now()}`;
    const generateBody = JSON.stringify({
      desc: 'Create a subtle, high-quality animation of a black hole in space. Begin with a distant view of the black hole against a starry background. Slowly zoom towards the black hole, revealing more detail. As the camera approaches, show the accretion disk of swirling matter around the black hole, with subtle variations in color and brightness. Continue the zoom, moving around the black hole to showcase its three-dimensional nature and the warping of space-time near its event horizon. Finally, zoom in towards the event horizon, depicting the increasing gravitational effects on light and nearby matter. The entire animation should be smooth and gradual, emphasizing the awe-inspiring nature of the black hole rather than rapid or dramatic movements.',
    });

    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: headers,
      body: generateBody,
    });

    if (!generateResponse.ok) {
      throw new Error(`HTTP error! status: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    console.log(
      'Video generation response:',
      JSON.stringify(generateData, null, 2)
    );

    if (generateData.data && generateData.data.id) {
      const videoId = generateData.data.id;

      // Step 2: Check processing state
      const checkUrl = `${baseUrl}/video/processing?idList=${videoId}&${commonParams}&unix=${Date.now()}`;

      // Function to check processing state
      const checkProcessingState = async () => {
        const checkResponse = await fetch(checkUrl, {
          method: 'GET',
          headers: headers,
        });

        if (!checkResponse.ok) {
          throw new Error(`HTTP error! status: ${checkResponse.status}`);
        }

        const checkData = await checkResponse.json();
        console.log('Processing state:', JSON.stringify(checkData, null, 2));

        if (
          checkData.data &&
          checkData.data.videos &&
          checkData.data.videos.length > 0
        ) {
          const videoData = checkData.data.videos[0];
          console.log('Video data:', JSON.stringify(videoData, null, 2));

          if (
            videoData.status === 2 &&
            videoData.percent === 100 &&
            videoData.coverURL &&
            videoData.videoURL
          ) {
            console.log('Video processing completed');
            return {
              desc: videoData.desc,
              coverURL: videoData.coverURL,
              videoURL: videoData.videoURL,
              percent: videoData.percent,
            };
          } else {
            console.log(
              `Video still processing (status: ${videoData.status}, percent: ${videoData.percent}), checking again in 5 seconds...`
            );
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return checkProcessingState();
          }
        } else {
          console.log(
            'Unexpected response structure, checking again in 5 seconds...'
          );
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return checkProcessingState();
        }
      };

      // Start checking processing state
      const finalVideoData = await checkProcessingState();
      console.log('Final video data:', finalVideoData);
      return finalVideoData;
    } else {
      throw new Error('Failed to get video ID from generation response');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function and handle the result
generateAndCheckVideo()
  .then((result) => {
    if (result) {
      console.log('Video generation completed successfully');
      console.log('Description:', result.desc);
      console.log('Cover URL:', result.coverURL);
      console.log('Video URL:', result.videoURL);
    } else {
      console.log('Video generation failed or timed out');
    }
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });
