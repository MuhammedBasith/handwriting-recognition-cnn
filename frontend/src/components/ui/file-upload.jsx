import { cn } from "../../../lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

export const FileUpload = ({ onChange }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  const [prediction, setPrediction] = useState(""); // Store prediction result
  const [selectedOption, setSelectedOption] = useState(""); // Dropdown value
  const fileInputRef = useRef(null);

  const handleFileChange = (newFiles) => {
    const jpgFile = newFiles[0];

    if (!jpgFile || (jpgFile.type !== "image/jpeg" && jpgFile.type !== "image/jpg")) {
      alert("Only JPG images are allowed.");
      return;
    }

    setFile(jpgFile);
    onChange && onChange(jpgFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: { "image/jpeg": [".jpg", ".jpeg"] },
    onDrop: handleFileChange,
  });

  const handlePredictionRequest = async () => {
    if (!file || !selectedOption) {
      alert("Please upload a file and select a prediction option.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prediction_type", selectedOption); // Send the selected option to the backend

    setLoading(true);
    setPrediction(""); // Clear previous prediction
    try {
      const response = await axios.post("http://localhost:4001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Display the prediction result
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error during prediction:", error);
      alert("Failed to make a prediction.");
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPrediction("");
    setSelectedOption("");
  };

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden">
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept=".jpg,.jpeg"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          {loading ? (
            <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
              Model is predicting...
            </p>
          ) : prediction ? (
            <div className="relative z-20 text-center">
              <p className="font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Prediction Result:
              </p>
              <p className="mt-2 text-4xl text-neutral-500 dark:text-neutral-400">“{prediction}”</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={resetUpload}>
                Upload a New File
              </button>
            </div>
          ) : (
            <>
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Upload file
              </p>
              <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                Drag or drop your file here or click to upload
              </p>
            </>
          )}
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {file ? (
              <motion.div
                layoutId="file-upload"
                className="relative z-40 bg-white dark:bg-neutral-900 flex flex-col items-center p-4 rounded-md">
                {/* Image preview */}
                <img
                  src={URL.createObjectURL(file)}
                  alt="Uploaded preview"
                  className="w-full h-auto max-w-md rounded-md mb-4"
                />
                <p className="text-base text-neutral-700 dark:text-neutral-300 truncate">
                  {file.name}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {file.type}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Modified: {new Date(file.lastModified).toLocaleDateString()}
                </p>
              </motion.div>
            ) : (
              <motion.div
                layoutId="file-upload-placeholder"
                className="relative z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md">
                {isDragActive ? (
                  <p className="text-neutral-600">Drop it here</p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {file && !prediction && (
        <div className="mt-6">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="px-4 py-2 border rounded w-full">
            <option value="" disabled>
              Select Prediction Type
            </option>
            <option value="one_word">One Word Prediction</option>
            <option value="sentence">Sentence Prediction</option>
          </select>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full"
            onClick={handlePredictionRequest}>
            Predict
          </button>
        </div>
      )}
    </div>
  );
};