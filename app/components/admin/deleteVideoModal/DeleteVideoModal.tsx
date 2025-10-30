import React from "react";
import Modal from "../modal/Modal";
import { apiUrl } from "@/helpers/publicApi"

export default function DeleteVideoModal({ isOpen, closeModal, videoId }: any) {
  async function deleteVideo() {
    if (!videoId) {
      alert("No video selected");
      return;
    }

    const response = await fetch(apiUrl('/api/video/'), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: videoId }),
    });

    if (response.ok) {
      closeModal();
      location.reload();
    } else {
      alert("Failed to delete course");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Supprimer le video"
      footer={
        <div className="flex justify-end">
          <button
            onMouseDown={closeModal}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
          >
            Fermer
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onMouseDown={deleteVideo}
          >
            Confirmer
          </button>
        </div>
      }
    >
      <div className="p-6 text-center">
        <p className="text-lg text-gray-700 dark:text-gray-200">
          Êtes-vous sûr que vous voulez supprimer le video?
        </p>
      </div>
    </Modal>
  );
}
