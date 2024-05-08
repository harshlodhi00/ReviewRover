import { useState } from "react";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { pdfToImage } from "./utils/pdf";

import DarkTheme from "./utils/DarkTheme";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-pro-vision",
  generationConfig: {
    temperature: 0.4,
    topP: 1,
    topK: 32,
    maxOutputTokens: 4096,
  },
});

const prompt_gentle =
  "Offer encouraging and constructive feedback on this resume. Highlight its strengths, suggest areas for improvement, and provide gentle guidance for enhancement.";

const prompt_moderate =
  "Provide a balanced review of this resume, pointing out both its positive aspects and areas that could use improvement. Offer constructive criticism with a supportive tone.";

const prompt_rigorous =
  "Delve deep into this resume with a critical eye. Leave no stone unturned as you analyze its strengths and weaknesses. Offer detailed feedback and precise recommendations for enhancement, focusing on thorough critique.";

const prompt_professional =
  "Create a well-organized HTML-formatted review for this resume. Include sections for Overall, Resume Format, Grammar/Spelling, Content, Style, and any other relevant areas. Ensure a visually appealing layout and provide insights or recommendations where applicable. Be honest and straightforward in your feedback.";

const prompt_roast =
  "Embrace your inner critic and let loose! Generate a hilariously sarcastic HTML-formatted roast for this resume. Tear apart the Overall, Resume Format, Grammar/Spelling, Content, Style, and any other aspects you find amusing. Add a touch of humor and wit, but make sure it's all in good fun. Roast away!";

type GenerativePart = { inlineData: { data: string; mimeType: string } };
function fileToGenerativePart(file: File) {
  return new Promise<GenerativePart>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        const base64Data = btoa(event.target.result);
        const mimeType = file.type;

        resolve({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      } else {
        reject(new Error("Error reading file"));
      }
    };

    reader.onerror = (event) => {
      console.error(event);
      reject(new Error("Error reading file"));
    };

    reader.readAsBinaryString(file);
  });
}

export default function Root() {
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  const [mode, setMode] = useState<"professional" | "roast">("roast");
  const [criticismMode, setCriticismMode] = useState<
    "Gentle" | "Moderate" | "Rigorous"
  >("Moderate");

  const handleFileUpload = async (file: File) => {
    const imageParts = await Promise.all(
      file.type === "pdf" || file.type === "application/pdf"
        ? (await pdfToImage(file)).map(fileToGenerativePart)
        : [fileToGenerativePart(file)],
    );

    let finalPrompt = "";

    if (mode === "roast") {
      if (criticismMode === "Gentle") {
        finalPrompt = prompt_gentle + prompt_roast;
      } else if (criticismMode === "Moderate") {
        finalPrompt = prompt_moderate + prompt_roast;
      } else if (criticismMode === "Rigorous") {
        finalPrompt = prompt_rigorous + prompt_roast;
      }
    } else if (mode === "professional") {
      if (criticismMode === "Gentle") {
        finalPrompt = prompt_gentle + prompt_professional;
      } else if (criticismMode === "Moderate") {
        finalPrompt = prompt_moderate + prompt_professional;
      } else if (criticismMode === "Rigorous") {
        finalPrompt = prompt_rigorous + prompt_professional;
      }
    }

    // const { response } = await model.generateContent([
    //   ...imageParts,
    //   mode === "roast" ? prompt_roast : prompt_professional,
    // ]);
    const { response } = await model.generateContent([
      ...imageParts,
      finalPrompt,
    ]);

    const outputRaw = response.text();

    setReview(outputRaw);
  };

  return (
    <div className="flex flex-col items-stretch justify-start gap-16 p-8 pb-0 container mx-auto">
      <div className="mx-auto flex flex-col items-center justify-start ">
        <div className="flex flex-row items-center justify-start gap-4 mx-auto">
          <img src="/logo.svg" width={50} height={50} alt="logo" />
          <h1 className="text-xl font-bold">Resume Rover</h1>
        </div>
        <p className="mt-6 text-center  ">
          Select the type of review you want and also set the intensity of the
          review.
        </p>
      </div>

      <form
        className="flex flex-col items-stretch justify-start gap-4 mx-auto max-w-sm w-full"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.target as HTMLFormElement);
          const file = formData.get("resume") as File;

          if (!file) {
            console.log("No file selected");
            return;
          }

          setLoading(true);

          handleFileUpload(file).finally(() => {
            setLoading(false);
            (event.target as HTMLFormElement)?.reset?.();
          });
        }}
      >
        <fieldset disabled={loading} className="contents">
          <select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as "professional" | "roast")
            }
            className="px-3 py-1.5 dark:bg-black border dark:border-white rounded-md text-white bg-gray-500 "
            required
          >
            <option value="professional">Professional</option>
            <option value="roast">Roast</option>
          </select>

          <select
            value={criticismMode}
            onChange={(event) =>
              setCriticismMode(
                event.target.value as "Gentle" | "Moderate" | "Rigorous",
              )
            }
            className="px-3 p-1.5 dark:bg-black text-white border dark:border-white rounded-md bg-gray-500"
            required
          >
            <option value="Gentle">Gentle</option>
            <option value="Moderate">Moderate</option>
            <option value="Rigorous">Rigorous</option>
          </select>
          <label
            className="w-full border border-slate-400 rounded-lg px-3 py-1.5 border-dashed cursor-pointer text-center"
            htmlFor="resume"
          >
            <span className="text-sm opacity-50">
              {resumeFileName ? resumeFileName : "Upload Resume"}
            </span>
            <input
              id="resume"
              type="file"
              accept="image/*,.pdf"
              name="resume"
              required
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  setResumeFileName(file.name);
                }
              }}
            />
          </label>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-60 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Review"}
          </button>
        </fieldset>
      </form>

      {review ? (
        <div
          className="prose prose-neutral prose-sm prose-pink prose-invert mx-auto w-full max-w-2xl rounded-lg bg-gray-500  dark:bg-neutral-900  text-white p-6 mb-10 "
          dangerouslySetInnerHTML={{ __html: review }}
        ></div>
      ) : null}

      <div className="fixed top-2 right-2 md:top-10 md:right-10 md:w-[50px] md:h-[50px] md:border-2 md:border-[#000000] dark:border-white rounded-full ">
        <DarkTheme />
      </div>

      <div className=" w-[100%] h-[50px] text-center md:px-6 ">
        &copy; {new Date().getFullYear()} - Made by ❤️ by{" "}
        <a
          className=" dark:text-blue-300 leading-6 underline hover:text-blue-400 duration-100"
          target="_blank"
          href="https://harshlodhi.netlify.app/"
        >
          Harsh Lodhi
        </a>
      </div>
    </div>
  );
}
