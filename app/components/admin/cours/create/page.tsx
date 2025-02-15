"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/admin/breadcrumbs/Breadcrumb";
import LoadingSpinner from "@/app/components/admin/LoadingSpinner";

interface FormData {
  name: string;
  description: string;
  module: string;
  language: string;
  level: string;
  is_premium: boolean;
  is_sup: boolean;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [isCustomLevel, setIsCustomLevel] = useState(false);
  const [customLevel, setCustomLevel] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    module: "",
    language: "",
    level: "",
    is_premium: false,
    is_sup: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moduleResponse, languageResponse, levelResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?module=true`),
          fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?language=true`),
          fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/filters?level=true`)
        ]);

        const moduleData = await moduleResponse.json();
        const languageData = await languageResponse.json();
        const levelData = await levelResponse.json();

        setModules(moduleData.uniqueModules);
        setLanguages(languageData.uniqueLanguages);
        setLevels(levelData.uniqueLevels.filter(level => level !== "create"));
      } catch (error) {
        setError("Error loading form data. Please try again.");
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Le nom du cours est requis");
      return false;
    }
    if (!formData.description.trim()) {
      setError("La description est requise");
      return false;
    }
    if (!formData.module) {
      setError("Le module est requis");
      return false;
    }
    if (!formData.language) {
      setError("La langue est requise");
      return false;
    }
    if (isCustomLevel && !customLevel.trim()) {
      setError("Le nouveau niveau est requis");
      return false;
    }
    if (!isCustomLevel && !formData.level) {
      setError("Le niveau est requis");
      return false;
    }
    if (!file) {
      setError("L'image du cours est requise");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      if (file) {
        const checksum = await computeSHA256(file);
        formDataToSend.append("file", file);
        formDataToSend.append("fileType", file.type);
        formDataToSend.append("fileSize", file.size.toString());
        formDataToSend.append("checksum", checksum);
      }

      // Use custom level if it's enabled, otherwise use selected level
      const finalLevel = isCustomLevel ? customLevel : formData.level;

      // Append other form data
      Object.entries({ ...formData, level: finalLevel }).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}api/course`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      const result = await response.json();
      router.push(`/admin/cours/edit/${result.newCourse.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Échec de la création du cours. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Créer un nouveau cours" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Détails du cours
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Image du cours <span className="text-meta-1">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-[200px] rounded-lg border border-stroke"
                  />
                </div>
              )}
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Nom du cours <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Entrez le nom du cours"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            <div className="mb-4.5">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Module <span className="text-meta-1">*</span>
                  </label>
                  <select
                    name="module"
                    value={formData.module}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="">Sélectionnez un module</option>
                    {modules.map((module) => (
                      <option key={module} value={module}>
                        {module}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Langue <span className="text-meta-1">*</span>
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  >
                    <option value="">Sélectionnez une langue</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Niveau <span className="text-meta-1">*</span>
                  </label>
                  <div className="space-y-4">
                    <select
                      name="level"
                      value={isCustomLevel ? "custom" : formData.level}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomLevel(true);
                          setFormData(prev => ({ ...prev, level: "" }));
                        } else {
                          setIsCustomLevel(false);
                          handleInputChange(e);
                        }
                      }}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">Sélectionnez un niveau</option>
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                      <option value="custom">Créer un nouveau niveau</option>
                    </select>

                    {isCustomLevel && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={customLevel}
                          onChange={(e) => {
                            setCustomLevel(e.target.value);
                            setFormData(prev => ({ ...prev, level: e.target.value }));
                          }}
                          placeholder="Entrez le nouveau niveau"
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Assurez-vous que le nouveau niveau suit le format existant (ex: "BAC (1ère année)")
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4.5">
              <div className="flex gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="ml-2 text-black dark:text-white">
                    Cours Premium
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_sup"
                    checked={formData.is_sup}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="ml-2 text-black dark:text-white">
                    Cours Avancé
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Description <span className="text-meta-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Entrez la description du cours"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              {loading ? "Création en cours..." : "Créer le cours"}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}

const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};