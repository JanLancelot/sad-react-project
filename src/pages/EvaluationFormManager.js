import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const EvaluationFormManager = () => {
  const [formData, setFormData] = useState({
    questions: [],
    values: [],
    essayQuestions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formId, setFormId] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const formCollectionRef = collection(db, 'evaluationForms');
        const formDoc = formId
          ? await getDoc(doc(formCollectionRef, formId))
          : null;

        if (formDoc && formDoc.exists()) {
          setFormData(formDoc.data());
        } else {
          setFormData({
            questions: [],
            values: [],
            essayQuestions: [],
          });
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

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

  const handleSaveForm = async () => {
    try {
      const formCollectionRef = collection(db, 'evaluationForms');
      if (formId) {
        await updateDoc(doc(formCollectionRef, formId), formData);
      } else {
        const newFormDocRef = await addDoc(formCollectionRef, formData);
        setFormId(newFormDocRef.id);
      }
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">{formId ? 'Update Evaluation Form' : 'Create New Evaluation Form'}</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Questions</h3>
        {formData.questions.map((question, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
            />
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
          <div key={index} className="mb-4">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleValueChange(index, e.target.value)}
            />
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
          <div key={index} className="mb-4">
            <textarea
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question}
              onChange={(e) => handleEssayQuestionChange(index, e.target.value)}
            />
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
        Save Form
      </button>
    </div>
  );
};

export default EvaluationFormManager;
