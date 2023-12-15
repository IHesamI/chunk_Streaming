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
    const aborter = new AbortController();

    const response = await fetch("http://localhost:3000/getmsg", {
      method: "GET",
      signal: aborter.signal,
    });
    let url ;
    let res;
    for await (const chunk of chunkStream(response.body)) {
      // thebuffer=chunk;
      res = new Response(chunk);
      if (aborter.signal) {
        break;
      }
    }
    const blob = await res.blob();
    console.error(blob);
    url =URL.createObjectURL(blob);
    setUrl(url);
    
    console.error("zarp namosan");
    // .then(res=>res.body)
    // const buffer = await result.json();
    // console.error(buffer);
  }
  
  async function* chunkStream(stream){
    const reader = stream.getReader();
    try{
    while (true){
      const {done,value}=await reader.read();
      if (done) return;
      // console.error(value);
      yield value;
    }
    }
    finally{
      reader.releaseLock();
    }
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
