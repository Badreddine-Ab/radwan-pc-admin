import LoadingSpinner from "../LoadingSpinner";
import Modal from "../modal/Modal";

import React, { useEffect, useState } from "react";

function CreateVideoModal({ isOpen, closeModal, chapitreId }: any) {
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleAddVideo() {
    setLoading(true);
    const body = JSON.stringify({
      title: videoTitle,
      url: videoUrl,
      chapitreId,
    });
    const response = await fetch(
      `/api/video`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      setLoading(false);
      location.reload();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Ajouter une video au cours"
      footer={
        <div className="flex justify-end">
          <button
            onMouseDown={closeModal}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Fermer
          </button>
          <button
            className="bg-blue-500 text-white px-4 rounded"
            onMouseDown={handleAddVideo}
          >
            Confirmer
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5.5 p-6.5 overflow-auto">
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Video Title
          </label>
          <input
            onChange={(e) => setVideoTitle(e.target.value)}
            type="text"
            id="video-title"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter video title"
            required
          />

          <label className="my-3 block text-sm font-medium text-black dark:text-white">
            Video URL
          </label>
          <input
            onChange={(e) => setVideoUrl(e.target.value)}
            type="text"
            id="video-url"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter video URL"
            required
          />
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white bg-opacity-80 z-50">
          <LoadingSpinner />
        </div>
      )}
    </Modal>
  );
}

export default CreateVideoModal;
