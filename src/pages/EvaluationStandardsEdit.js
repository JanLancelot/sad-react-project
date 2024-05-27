import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Make sure to import firebaseConfig

const EvaluationStandardsEdit = () => {
  const { standardId } = useParams(); // Get the standardId from the URL
  const [formData, setFormData] = useState({
    name: '',
    questions: [],
    values: [],
    essayQuestions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandard = async () => {
      try {
        const standardDocRef = doc(db, 'evaluationForms', standardId);
        const standardDocSnapshot = await getDoc(standardDocRef);
        if (standardDocSnapshot.exists()) {
          setFormData(standardDocSnapshot.data());
        } else {
          setError('Standard not found.');
        }
      } catch (error) {
        console.error('Error fetching standard:', error);
        setError('Failed to load evaluation standard.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStandard();
  }, [standardId]);

  const handleNameChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      name: e.target.value,
    }));
  };

  const handleQuestionChange = (index, value) => {
    setFormData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((question, i) =>
        i === index ? value : question
      ),
    }));
  };

  const handleValueChange = (index, value) => {
    setFormData((prevData) => ({
      ...prevData,
      values: prevData.values.map((val, i) => (i === index ? value : val)),
    }));
  };

  const handleEssayQuestionChange = (index, value) => {
    setFormData((prevData) => ({
      ...prevData,
      essayQuestions: prevData.essayQuestions.map((question, i) =>
        i === index ? value : question
      ),
    }));
  };

  const handleAddQuestion = () => {
    setFormData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, ''],
    }));
  };

  const handleAddValue = () => {
    setFormData((prevData) => ({
      ...prevData,
      values: [...prevData.values, ''],
    }));
  };

  const handleAddEssayQuestion = () => {
    setFormData((prevData) => ({
      ...prevData,
      essayQuestions: [...prevData.essayQuestions, ''],
    }));
  };

  const handleDeleteQuestion = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      questions: prevData.questions.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteValue = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      values: prevData.values.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteEssayQuestion = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      essayQuestions: prevData.essayQuestions.filter((_, i) => i !== index),
    }));
  };

  const handleSaveForm = async () => {
    if (!formData.name) {
      setError('Evaluation name is required');
      return;
    }

    try {
      const standardDocRef = doc(db, 'evaluationForms', standardId);
      await updateDoc(standardDocRef, formData);
      setError(null);
    } catch (error) {
      console.error('Error saving form:', error);
      setError('Error saving form');
    }
  };

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
      <h2 className="text-2xl font-semibold mb-4">Edit Evaluation Standard</h2>
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Evaluation Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={handleNameChange}
        />
      </div>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Questions</h3>
        {formData.questions.map((question, index) => (
          <div key={index} className="flex items-center mb-4">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
            />
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
              onClick={() => handleDeleteQuestion(index)}
            >
              Delete
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          onClick={handleAddQuestion}
        >
          Add Question
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Values</h3>
        {formData.values.map((value, index) => (
          <div key={index} className="flex items-center mb-4">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleValueChange(index, e.target.value)}
            />
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
              onClick={() => handleDeleteValue(index)}
            >
              Delete
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          onClick={handleAddValue}
        >
          Add Value
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Essay Questions</h3>
        {formData.essayQuestions.map((question, index) => (
          <div key={index} className="flex items-center mb-4">
            <textarea
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question}
              onChange={(e) => handleEssayQuestionChange(index, e.target.value)}
            />
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
              onClick={() => handleDeleteEssayQuestion(index)}
            >
              Delete
            </button>
          </div>
        ))}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
          onClick={handleAddEssayQuestion}
        >
          Add Essay Question
        </button>
      </div>
      <button
        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
        onClick={handleSaveForm}
      >
        Save Changes
      </button>
    </div>
  );
};

export default EvaluationStandardsEdit;