"use client";

import { uploadVideo } from "@/actions/actions";
import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const uploadVideoMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile) throw new Error("No video selected");
      setProcessing(true);
      const response = await uploadVideo(videoFile);
      return response;
    },
    onSuccess: (data) => {
      toast.success("Video uploaded successfully!");
      setVideoFile(null);
      setGeneratedVideoUrl(data.final_video_url);
      setProcessing(false);
    },
    onError: (error: any) => {
      toast.error(error?.error || "Failed to upload video");
      setProcessing(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "video/mp4") {
      toast.error("Please upload a valid .mp4 video file.");
      return;
    }
    setVideoFile(file);
    setGeneratedVideoUrl(null);
  };

  return (
    <main
      className={`${
        darkMode ? "bg-gray-950 text-white" : "bg-white text-black"
      } min-h-screen flex flex-col items-center px-4 py-6 transition-colors duration-300`}
    >
      {/* Theme Toggle and Logout */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        {/* Theme Toggle */}
        <div className="flex items-center space-x-4 ml-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{darkMode ? "🌙" : "☀️"}</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-14 h-8 flex items-center rounded-full p-1 ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              } transition-colors duration-300`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut()}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-blue-500 mb-2">LinguaSync</h1>
      <p className="text-md text-center mb-6 max-w-xl">
        Speech-to-Speech Translation with Automated Lip-Synced Video Using
        Deepfake and TTS
      </p>

      {/* Instructions */}
      <div
        className={`border p-4 rounded-md max-w-2xl mb-6 ${
          darkMode
            ? "border-yellow-700 bg-gray-900 text-yellow-300"
            : "border-yellow-400 bg-yellow-100 text-yellow-800"
        }`}
      >
        <h2 className="text-lg font-semibold mb-2">Before Uploading</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Use short videos (6–15s) with clear frontal face.</li>
          <li>Processing may take time—please be patient.</li>
        </ul>
      </div>

      {/* Upload Form */}
      <label
        className={`cursor-pointer px-6 py-3 rounded-lg text-white ${
          processing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } transition mb-4`}
      >
        Upload Video (.mp4)
        <input
          type="file"
          accept="video/mp4"
          disabled={processing}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Selected Video Preview */}
      {videoFile && (
        <video
          src={URL.createObjectURL(videoFile)}
          controls
          className="w-full max-w-2xl mt-4 rounded shadow"
        />
      )}

      {/* Generate Video Button */}
      <button
        onClick={() => uploadVideoMutation.mutate()}
        disabled={!videoFile || processing}
        className={`mt-6 px-6 py-3 rounded-lg font-medium text-white ${
          !videoFile || processing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        } transition`}
      >
        {processing ? "Processing..." : "Generate Video"}
      </button>

      {/* Loader */}
      {processing && (
        <div className="mt-4 flex items-center space-x-3">
          <div className="h-5 w-5 border-2 border-white border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Please wait...</span>
        </div>
      )}

      {/* Generated Video Preview */}
      {generatedVideoUrl && !processing && (
        <div className="mt-6">
          <video
            src={generatedVideoUrl}
            controls
            className="w-full max-w-2xl rounded shadow"
          />
        </div>
      )}

      {/* What Does It Do Section */}
      <section
        className={`mt-16 p-6 max-w-3xl rounded shadow-md text-center ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-bold text-blue-500 mb-2">
          What Does LinguaSync Do?
        </h2>
        <p>
          LinguaSync translates English speech to Urdu, generates cloned Urdu
          audio, and synchronizes the original video’s lips using Wav2Lip to
          produce a natural result.
        </p>
      </section>

      {/* About Footer */}
      <footer className="mt-20 max-w-4xl text-center text-sm p-6 border-t border-gray-300">
        <p className="mb-2">Built with:</p>
        <ul className="list-disc list-inside text-left max-w-sm mx-auto space-y-1">
          <li>Assembly AI – Transcription</li>
          <li>Google Translate API – Language translation</li>
          <li>XTTS v2 (Urdu fine-tuned) – Voice synthesis</li>
          <li>Wav2Lip – Lip synchronization</li>
        </ul>
        <p className="mt-4">
          Final Year Project by <strong>Umar Farooq</strong> and{" "}
          <strong>Shaheer Ijaz</strong>.
        </p>
      </footer>
    </main>
  );
}
