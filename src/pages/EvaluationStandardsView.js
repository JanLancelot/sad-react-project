import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom';

const EvaluationStandardsView = () => {
  const [standards, setStandards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const standardsCollectionRef = collection(db, 'evaluationForms');
        const standardsSnapshot = await getDocs(standardsCollectionRef);
        const fetchedStandards = standardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStandards(fetchedStandards);
      } catch (error) {
        console.error('Error fetching standards:', error);
        setError('Failed to load evaluation standards.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStandards();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Evaluation Standards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {standards.map((standard) => (
          <div
            key={standard.id}
            className="bg-gray-100 rounded-md p-4 shadow-sm hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold mb-2">{standard.name}</h3>
            <div className="mt-2">
              <Link
                to={`/evaluation-standards/edit/${standard.id}`}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Edit
              </Link>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none ml-2"
              >
                Archive
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationStandardsView;