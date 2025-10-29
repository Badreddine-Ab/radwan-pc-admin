"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "react-modal";
import "./ModalComponent.css";
import axios from "axios";

interface ModalComponentProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

function ModalComponent({ isOpen, onRequestClose }: ModalComponentProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        fetch(`/api/modules`)
          .then((response) => response.json())
          .then((data) => {
            setSubjects(data.uniqueModules);
          })
          .catch((error) => {
            console.error("Error fetching modules:", error);
          });
      } catch (error) {
        console.error("Failed to fetching modules", error);
      }
    };

    fetchSubjects();
  }, []);
  const courses = ["Les suites Numériques"];

  const handleSubjectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const subject = e.target.value;
    if (subject && !selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleCourseChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Select Subjects and Courses"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>Sélectionnez les matières et les branches</h2>
        <button onClick={onRequestClose} className="close-button">
          &times;
        </button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label htmlFor="subjects">choisir la matière *</label>
          <select id="subjects" onChange={handleSubjectChange}>
            <option value="">cliquer ici pour voir les matières</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <div className="selected-subjects">
            {selectedSubjects.map((subject, index) => (
              <span key={index} className="subject-tag">
                {subject}
              </span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="course">choisir le cours *</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={handleCourseChange}
          >
            <option value="">cliquer ici pour choisir le cours</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onRequestClose} className="modal-button close">
          Fermer
        </button>
        <button className="modal-button search">Chercher</button>
      </div>
    </Modal>
  );
}

export default ModalComponent;
