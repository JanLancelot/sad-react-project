import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Layout from "./Layout";
import { Link, useNavigate } from "react-router-dom";

const EvaluationStandardsView = () => {
  const [standards, setStandards] = useState([]);
  const [archivedStandards, setArchivedStandards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const standardsCollectionRef = collection(db, "evaluationForms");
        const standardsSnapshot = await getDocs(standardsCollectionRef);
        const fetchedStandards = standardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isArchived: doc.data().isArchived || false,
        }));
        setStandards(fetchedStandards.filter((standard) => !standard.isArchived));
        setArchivedStandards(fetchedStandards.filter((standard) => standard.isArchived));
      } catch (error) {
        console.error("Error fetching standards:", error);
        setError("Failed to load evaluation standards.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStandards();
  }, []);

  const handleArchive = async (standardId) => {
    try {
      const standardDocRef = doc(db, "evaluationForms", standardId);
      await updateDoc(standardDocRef, { isArchived: true });

      const updatedStandards = standards.filter((standard) => standard.id !== standardId);
      const archivedStandard = standards.find((standard) => standard.id === standardId);
      setStandards(updatedStandards);
      setArchivedStandards([...archivedStandards, archivedStandard]);
    } catch (error) {
      console.error("Error archiving standard:", error);
      setError("Failed to archive the standard.");
    }
  };

  const handleDelete = async (standardId) => {
    try {
      const standardDocRef = doc(db, "evaluationForms", standardId);
      await deleteDoc(standardDocRef);

      const updatedStandards = standards.filter((standard) => standard.id !== standardId);
      const updatedArchivedStandards = archivedStandards.filter((standard) => standard.id !== standardId);
      setStandards(updatedStandards);
      setArchivedStandards(updatedArchivedStandards);
    } catch (error) {
      console.error("Error deleting standard:", error);
      setError("Failed to delete the standard.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4">Evaluation Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standards.map((standard) => (
            <div key={standard.id} className="bg-gray-100 rounded-md p-4 shadow-sm hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-semibold mb-2">{standard.name}</h3>
              <div className="mt-2">
                <Link to={`/evaluation-standards/edit/${standard.id}`} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none">
                  Edit
                </Link>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none ml-2"
                  onClick={() => handleArchive(standard.id)}
                >
                  Archive
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none ml-2"
                  onClick={() => handleDelete(standard.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {archivedStandards.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4 mt-8">Archived Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedStandards.map((standard) => (
                <div key={standard.id} className="bg-gray-100 rounded-md p-4 shadow-sm hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-semibold mb-2">{standard.name}</h3>
                  <div className="mt-2">
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                      onClick={() => handleDelete(standard.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default EvaluationStandardsView;