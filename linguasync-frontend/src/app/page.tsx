"use client";

import { uploadVideo } from "@/actions/actions";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export type AxiosErrorResponse = { error: string };

export default function HomePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Dark mode default

  const uploadVideoMutation = useMutation({
    mutationFn: () => {
      if (!videoFile) throw new Error("No video selected");
      setProcessing(true);
      return uploadVideo(videoFile);
    },
    onSuccess: (data) => {
      toast.success("Video uploaded successfully!");
      console.log("Uploaded video response:", data);
      setVideoFile(null);
      setGeneratedVideoUrl(data.final_video_url);
      setProcessing(false);
    },
    onError: (error: unknown) => {
      const err = error as AxiosErrorResponse;
      toast.error(err?.error || "Failed to upload video");
      setProcessing(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "video/mp4") {
      setVideoFile(file);
    } else {
      toast.error("Please upload a .mp4 video file only!");
    }
  };

  return (
    <main className={`${darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-800"} min-h-[100dvh] flex flex-col items-center justify-start p-6 font-sans transition-colors duration-300`}>
      
      {/* Toggle Button */}
      <div className="w-full flex justify-end">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm">{darkMode ? "🌙 Dark" : "☀️ Light"}</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-8 flex items-center rounded-full p-1 ${darkMode ? "bg-blue-600" : "bg-gray-300"} transition-colors duration-300`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-2 text-blue-500 mt-4 text-center">LinguaSync</h1>

      <h2 className="text-lg font-medium text-gray-400 text-center mb-8">
        Speech-to-Speech Translation with Automated Lip-Synced Video Using Deepfake and TTS
      </h2>

      {/* Instructions / Warnings */}
      <section className={`${darkMode ? "bg-gray-900 border-yellow-700 text-yellow-300" : "bg-yellow-100 border-yellow-400 text-yellow-800"} border p-4 rounded-md w-full max-w-2xl mb-8`}>
        <h2 className="text-xl font-semibold mb-2">Please Read Before Uploading</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>The app may take some time to finish processing. Please be patient.</li>
          <li>Videos without a clearly visible face may fail after a while.</li>
          <li>Translation accuracy may vary based on sentence complexity and language challenges.</li>
          <li>Ideally, use clips with a length between 6 to 15 seconds to avoid long waiting times.</li>
        </ul>
      </section>

      {/* Upload Button */}
      <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-4">
        Upload Video (.mp4)
        <input
          type="file"
          accept="video/mp4"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Show selected video */}
      {videoFile && (
        <div className="mt-6">
          <video
            src={URL.createObjectURL(videoFile)}
            controls
            className="max-w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Upload button */}
      {!processing && (
        <button
          onClick={() => uploadVideoMutation.mutate()}
          disabled={!videoFile || uploadVideoMutation.isPending}
          className={`mt-6 px-8 py-3 rounded-lg font-semibold ${
            !videoFile || uploadVideoMutation.isPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white transition`}
        >
          {uploadVideoMutation.isPending ? "Uploading..." : "Upload Video"}
        </button>
      )}

      {/* Processing spinner */}
      {processing && (
        <div className="mt-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="mt-4 text-gray-400 text-sm">Processing video, please wait...</p>
        </div>
      )}

      {/* Final generated video */}
      {generatedVideoUrl && !processing && (
        <div className="mt-6">
          <video
            src={generatedVideoUrl}
            controls
            className="max-w-full max-h-[400px] rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* What Does LinguaSync Do Section */}
      <section className={`${darkMode ? "bg-gray-800" : "bg-white"} mt-20 w-full max-w-3xl text-center p-6 shadow-md rounded-md`}>
        <h2 className="text-2xl font-bold mb-4 text-blue-500">What Does LinguaSync Do?</h2>
        <p className="leading-relaxed text-md">
          LinguaSync takes an English-speaking video and translates the speech into Urdu. It
          generates a cloned voice in Urdu while ensuring the lip movements in the video match the new speech,
          providing a natural and synchronized viewing experience.
        </p>
      </section>

      {/* About Section */}
      <footer className="mt-16 w-full max-w-4xl text-center text-sm p-6 border-t border-gray-300">
        <h2 className="text-lg font-semibold mb-4">About LinguaSync</h2>
        <p className="mb-2">
          This application utilizes cutting-edge technologies:
        </p>
        <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto mb-4">
          <li>Assembly AI for Transcript Generation</li>
          <li>Google Cloud Translate for Translation</li>
          <li>XTTS v2 by Coqui (fine-tuned for Urdu by Suhaib Rashid) for Text-to-Speech</li>
          <li>Wav2Lip by Rudrabha for Lip Syncing</li>
        </ul>
        <p>
          Developed as a Final Year Project by <strong>Muhammad Umar Farooq</strong> and <strong>Muhammad Shaheer Ijaz</strong> for their Bachelor's Degree in Computer Science.
        </p>
      </footer>
    </main>
  );
}
