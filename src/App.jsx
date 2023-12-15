import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
function App() {
  const [url, setUrl] = useState("");

  async function handleupload(e) {
    const image = e.target.files[0];
    const imgurl = URL.createObjectURL(image);
    await sendChunks(image);
    console.error(imgurl);

    setUrl(imgurl);
  }

  async function sendChunks(file) {
    const chunks = [];
    let offset = 0;
    const chunkSize = 5 * 1024 * 1024;
    let counter = 1;
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize);
      try {
        const formchunk = new FormData();
        formchunk.append("chunk", chunk);
        formchunk.append("chunkNum", counter);
        const result = await fetch("http://localhost:3000/msg", {
          method: "POST",
          // headers: {
          //   'Content-Type': 'multipart/form-data',
          // },
          body: formchunk,
        });
        console.error(await result.json());
        offset += chunkSize;
      } catch (e) {
        console.error(e);
      }
      counter++;
    }
    return chunks;
  }
  async function handleClick(e) {
    fetch("http://localhost:3000/getmsg", { method: "GET" })
      // .then(res=>res.body)
      .then((res) => {
        const reader = res.body.getReader();
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      // Create a new response out of the stream
      .then((stream) => new Response(stream))
      // Create an object URL for the response
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      // Update image
      .then((url) => {
        setUrl(url)
      });
    // const buffer = await result.json();
    // console.error(buffer);
  }
  console.error(url);

  return (
    <>
      <video src={url} style={{ width: "250px", height: "250px" }}></video>
      <img
        src={url}
        alt="your image"
        style={{ width: "250px", height: "250px" }}
      />
      <input type="file" onInput={handleupload} />
      <button onClick={handleClick}>get image</button>
    </>
  );
}

export default App;
