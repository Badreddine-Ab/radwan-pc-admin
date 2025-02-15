"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CreateCourse from "../createCourseModal/CreateCourse";
import DeleteCourse from "../deleteCourseModal/DeleteCourse";
import Link from "next/link";
import LoadingSpinner from "../LoadingSpinner";

interface Course {
  id: string;
  name: string;
  description: string;
  is_sup: boolean;
  level: string;
  image: string;
  language: string;
  module: string;
  is_premium: boolean;
}

function Cours() {
  const params = useParams();
  const { level } = params;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const openDeleteModal = (course: Course) => {
    setIsDeleteModalOpen(true);
    setSelectedCourse(course);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setPageLoading(true);
      try {
        // Build URL based on whether level is specified
        const url = level 
          ? `${process.env.NEXT_PUBLIC_API_HOST}api/course?level=${level}&pageSize=50`
          : `${process.env.NEXT_PUBLIC_API_HOST}api/course?pageSize=50`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchCourses();
  }, [level]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white bg-opacity-80 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white bg-opacity-80 z-50">
          <LoadingSpinner />
        </div>
      )}
      <div>
        <div className="flex justify-center mb-4">
          <button
            onClick={openModal}
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="w-3.5 h-3.5 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 1v16M1 9h16"
              />
            </svg>
            Créer un nouveau cours
          </button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-4 justify-center w-full max-w-screen-lg">
            {courses.map((course: Course) => (
              <Link
                key={course.id}
                href={`/admin/cours/edit/${course.id}`}
                className="relative flex flex-col items-center bg-white border border-custom-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-custom-gray-100 dark:border-custom-gray-700 dark:bg-custom-gray-800 dark:hover:bg-custom-gray-700 flex-1 min-w-[300px] md:min-w-[400px] basis-[calc(50%-1rem)]"
              >
                <img
                  className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                  src={course.image}
                  alt=""
                />
                <div className="flex flex-col justify-between p-4 leading-normal">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-custom-gray-900 dark:text-white">
                    {course.name}
                  </h5>
                  <p className="mb-3 font-normal text-custom-gray-700 dark:text-custom-gray-400 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 text-sm bg-gray-100 rounded-full dark:bg-gray-700">
                      {course.level}
                    </span>
                    <span className="px-2 py-1 text-sm bg-gray-100 rounded-full dark:bg-gray-700">
                      {course.language}
                    </span>
                    {course.is_premium && (
                      <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <svg
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(course);
                    }}
                    className="w-6 h-6 text-red-500 hover:text-red-700 cursor-pointer"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {isOpen && (
        <CreateCourse
          isOpen={isOpen}
          closeModal={closeModal}
          level={level || ""}
        />
      )}
      
      {isDeleteModalOpen && selectedCourse && (
        <DeleteCourse
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          selectedCourse={selectedCourse}
        />
      )}
    </>
  );
}

export default Cours;