import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import priv from "../conf.priv.js";
import api from "../api.js";

const { Clipboard } = api;

/* Azure Speech services */
/* @see: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-text-to-speech?pivots=programming-language-javascript&tabs=macos%2Cterminal#synthesize-to-file-output */
/* @see: https://speech.microsoft.com/portal/voicegallery */
export const configureSpeechSDK = () => {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    priv.keys.speech_key,
    priv.keys.speech_region,
  );
  speechConfig.speechSynthesisVoiceName = "en-US-DavisNeural";

  const pushStream = sdk.PullAudioOutputStream.create();

  return {
    synthesizer: new sdk.SpeechSynthesizer(
      speechConfig,
      sdk.AudioConfig.fromStreamOutput(pushStream),
    ),
    pushStream,
  };
};

const readWithTimeout = (stream, buffer, timeout) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Read operation timed out"));
    }, timeout);

    stream
      .read(buffer)
      .then((bytesRead) => {
        clearTimeout(timer);
        resolve(bytesRead);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });

const readAllFromStream = async (pushStream) => {
  const dataBuffer = new ArrayBuffer(1024 * 10); // adjust size as needed
  const receivedData = [];
  let bytesRead;

  /* eslint-disable no-await-in-loop */
  try {
    do {
      bytesRead = await readWithTimeout(pushStream, dataBuffer, 5000); // 5 second timeout
      receivedData.push(new Uint8Array(dataBuffer.slice(0, bytesRead)));
    } while (bytesRead > 0);
  } catch (err) {
    console.error(`Error reading from stream: ${err}`);
  }

  return new Blob(receivedData, { type: "audio/wav" });
};

export const requestToAzure = (synthesizer, pushStream) => {
  Clipboard.read((response) => {
    const text = response.data;
    if (text === "") {
      console.error("Clipboard is empty");
      return;
    }

    synthesizer.speakTextAsync(
      text,
      async (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          // Convert the push stream to a blob and create a URL for it
          const audioBlob = await readAllFromStream(pushStream);
          const audioUrl = URL.createObjectURL(audioBlob);

          // Create a link to download the file
          const downloadLink = document.createElement("a");
          downloadLink.href = audioUrl;
          downloadLink.download = `${text}.wav`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else {
          console.error(
            `Speech synthesis canceled, ${result.errorDetails}\nDid you set the speech resource key and region values?`,
          );
        }
        synthesizer.close();
      },
      (err) => {
        console.trace(`err - ${err}`);
        synthesizer.close();
      },
    );
  });
};
