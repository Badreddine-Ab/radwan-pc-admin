"use client";

import React, { useEffect, useState } from "react";
import SwitcherOne from "../switcher/SwitcherOne";
import InputSearch from "../inputSearch/InputSearch";
import SwitcherTwo from "../switcher/SwitcherTwo";
import Modal from "../modal/Modal";
import LoadingSpinner from "../LoadingSpinner";

interface CourseModalProps {
  isOpen: boolean;
  closeModal: () => void;
  // If level is provided as a string, use it as the default;
  // otherwise, if it’s an array, ignore it because we use API data.
  level?: string | string[];
}

export default function CreateCourse({
  isOpen,
  closeModal,
  level,
}: CourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstStep, setFirstStep] = useState(true);
  const [modules, setModules] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [courseName, setCourseName] = useState("");
  const [superieur, setSuperieur] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [premium, setPremium] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  // If a default level is passed and it's not "create", use it; otherwise start empty.
  const [selectedLevel, setSelectedLevel] = useState(
    typeof level === "string" && level !== "create" ? level : ""
  );
  const [isCustomLevel, setIsCustomLevel] = useState(false);
  const [customLevel, setCustomLevel] = useState("");

  // States for chapter, video, and PDF steps
  const [chapitreStep, setChapitreStep] = useState(false);
  const [chapitreName, setChapitreName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [secondStep, setSecondStep] = useState(false);
  const [chapitreId, setChapitreId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thirdStep, setThirdStep] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(selectedFile.type)) {
        setError("Please select a valid image file (JPEG, PNG)");
        return;
      }
      // Validate file size (e.g., 5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const fetchData = async () => {
    try {
      const [moduleResponse, languageResponse, levelResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?module=true`),
        fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?language=true`),
        fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?level=true`),
      ]);

      const moduleData = await moduleResponse.json();
      const languageData = await languageResponse.json();
      const levelData = await levelResponse.json();

      setModules(moduleData.uniqueModules);
      setLanguages(languageData.uniqueLanguages);
      // Decode URL-encoded levels and filter out "create"
      setLevels(
        levelData.uniqueLevels
          .filter((lvl: string) => lvl !== "create")
          .map((lvl: string) => decodeURIComponent(lvl))
      );
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load form data. Please try again.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = (): boolean => {
    if (!courseName.trim()) {
      setError("Course name is required");
      return false;
    }
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!selectedModule) {
      setError("Module is required");
      return false;
    }
    if (!selectedLanguage) {
      setError("Language is required");
      return false;
    }
    if (!file) {
      setError("Course image is required");
      return false;
    }
    // When no valid level is chosen (and not creating a custom one)
    if (!((typeof level === "string" && level !== "create") || isCustomLevel || selectedLevel)) {
      setError("Level is required");
      return false;
    }
    if (isCustomLevel && !customLevel.trim()) {
      setError("Custom level name is required");
      return false;
    }
    return true;
  };

  async function createCourse() {
    setError(null);

    if (firstStep) {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const checksum = await computeSHA256(file!);
        const formData = new FormData();
        formData.append("file", file!);
        formData.append("fileType", file!.type);
        formData.append("fileSize", file!.size.toString());
        formData.append("checksum", checksum);
        formData.append("module", selectedModule);
        formData.append("is_sup", superieur.toString());
        formData.append("is_premium", premium.toString());
        formData.append("name", courseName);
        formData.append("language", selectedLanguage);
        formData.append("description", description);

        // Use custom level if chosen, otherwise check the prop.
        const finalLevel = isCustomLevel
          ? customLevel
          : (typeof level === "string" && level !== "create" ? level : selectedLevel);
        formData.append("level", finalLevel);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}api/course`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const course = await response.json();
        setCourseId(course.newCourse.id);
        setFirstStep(false);
        setChapitreStep(true);
      } catch (error) {
        console.error("Error creating course:", error);
        setError("Failed to create course. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (chapitreStep) {
      if (!chapitreName.trim()) {
        setError("Chapter name is required");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}api/chapitre`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: chapitreName,
              courseId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to create chapter: ${response.status}`);
        }

        const chapitre = await response.json();
        setChapitreId(chapitre.newChapitre.id);
        setChapitreStep(false);
        setSecondStep(true);
      } catch (error) {
        console.error("Error creating chapter:", error);
        setError("Failed to create chapter. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (secondStep) {
      // If both video title and URL are empty, allow skipping the video step
      if (!videoTitle.trim() && !videoUrl.trim()) {
        setSecondStep(false);
        setThirdStep(true);
        return;
      }

      // If one is filled but not the other, show an error
      if (!videoTitle.trim() || !videoUrl.trim()) {
        setError("Please provide both video title and URL, or leave both empty to skip.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}api/video`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: videoTitle,
              url: videoUrl,
              chapitreId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSecondStep(false);
        setThirdStep(true);
      } catch (error) {
        console.error("Error creating video:", error);
        setError("Failed to add video. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (thirdStep) {
      // PDF upload step
      if (!pdf || !pdfTitle.trim()) {
        setError("PDF file and title are required");
        return;
      }

      setLoading(true);
      try {
        const checksum = await computeSHA256(pdf);
        const formData = new FormData();
        formData.append("file", pdf);
        formData.append("title", pdfTitle);
        formData.append("chapitreId", chapitreId);
        formData.append("fileType", pdf.type);
        formData.append("fileSize", pdf.size.toString());
        formData.append("checksum", checksum);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}api/pdf`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          closeModal();
          location.reload();
        } else {
          throw new Error("Failed to upload PDF");
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
        setError("Failed to upload PDF. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Créer un cours"
      footer={
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
          >
            Fermer
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={createCourse}
            disabled={loading}
          >
            {loading ? "Creation en cours..." : "Confirmer"}
          </button>
        </div>
      }
    >
      {/* Progress Steps */}
      <nav className="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 justify-center items-center mb-6">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <a
              href="#"
              className={`inline-flex items-center text-sm font-medium ${
                firstStep ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Détails du cours
            </a>
          </li>
          <li className="flex items-center">
            <span className="mx-2">→</span>
            <a
              href="#"
              className={`inline-flex items-center text-sm font-medium ${
                chapitreStep ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Chapitre
            </a>
          </li>
          <li className="flex items-center">
            <span className="mx-2">→</span>
            <a
              href="#"
              className={`inline-flex items-center text-sm font-medium ${
                secondStep ? "text-blue-600" : "text-gray-700"
              }`}
            >
              Vidéo
            </a>
          </li>
          <li className="flex items-center">
            <span className="mx-2">→</span>
            <a
              href="#"
              className={`inline-flex items-center text-sm font-medium ${
                thirdStep ? "text-blue-600" : "text-gray-700"
              }`}
            >
              PDF
            </a>
          </li>
        </ol>
      </nav>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Steps */}
      {firstStep && (
        <div className="flex flex-col gap-4 p-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image du cours *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom du cours *
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              placeholder="Entrez le nom du cours"
            />
          </div>

          {/* Always show level selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Niveau *
            </label>
            <div className="mt-1 space-y-2">
              <select
                value={isCustomLevel ? "custom" : selectedLevel}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomLevel(true);
                    setSelectedLevel("");
                  } else {
                    setIsCustomLevel(false);
                    setSelectedLevel(e.target.value);
                  }
                }}
                className="block w-full border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Sélectionnez un niveau</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
                <option value="custom">Créer un nouveau niveau</option>
              </select>

              {isCustomLevel && (
                <input
                  type="text"
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value)}
                  placeholder="Entrez le nouveau niveau"
                  className="block w-full border border-gray-300 rounded-md shadow-sm"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Module *
              </label>
              <InputSearch
                input={modules}
                propvalue={selectedModule}
                setSelectedValue={setSelectedModule}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Langue *
              </label>
              <InputSearch
                input={languages}
                propvalue={selectedLanguage}
                setSelectedValue={setSelectedLanguage}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Préparation de concours
              </label>
              <SwitcherOne enabled={superieur} setEnabled={setSuperieur} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Premium
              </label>
              <SwitcherTwo enabled={premium} setEnabled={setPremium} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              placeholder="Entrez la description du cours"
            />
          </div>
        </div>
      )}

      {chapitreStep && (
        <div className="p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom du Chapitre *
            </label>
            <input
              type="text"
              value={chapitreName}
              onChange={(e) => setChapitreName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              placeholder="Entrez le nom du chapitre"
            />
          </div>
        </div>
      )}

      {secondStep && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Titre de la vidéo *
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              placeholder="Entrez le titre de la vidéo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL de la vidéo *
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              placeholder="Entrez l'URL de la vidéo"
            />
          </div>
        </div>
      )}

      {thirdStep && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Titre du PDF *
            </label>
            <input
              type="text"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
              placeholder="Entrez le titre du PDF"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fichier PDF *
            </label>
            <input
              type="file"
              onChange={(e) => setPdf(e.target.files?.[0] || null)}
              accept="application/pdf"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </Modal>
  );
}

const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};
