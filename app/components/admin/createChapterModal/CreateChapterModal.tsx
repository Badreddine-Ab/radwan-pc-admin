import Modal from "../modal/Modal";

import React, { useState } from "react";

function CreateChapterModal({ isOpen, closeModal, courseId }: any) {
  const [chapterTitle, setChapterTitle] = useState("");

  async function handleAddChapter() {
    const body = JSON.stringify({
      name: chapterTitle,
      courseId: courseId[0],
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}api/chapitre`,
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
      location.reload();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Ajouter une chapitre au cours"
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
            onMouseDown={handleAddChapter}
          >
            Confirmer
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5.5 p-6.5 overflow-auto">
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Titre du chapitre
          </label>
          <input
            onChange={(e) => setChapterTitle(e.target.value)}
            type="text"
            id="video-title"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter video title"
            required
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateChapterModal;
