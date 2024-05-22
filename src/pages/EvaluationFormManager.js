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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{formId ? 'Update Evaluation Form' : 'Create New Evaluation Form'}</h2>
      <div>
        <h3>Questions</h3>
        {formData.questions.map((question, index) => (
          <div key={index}>
            <input
              type="text"
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleAddQuestion}>Add Question</button>
      </div>
      <div>
        <h3>Values</h3>
        {formData.values.map((value, index) => (
          <div key={index}>
            <input
              type="text"
              value={value}
              onChange={(e) => handleValueChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleAddValue}>Add Value</button>
      </div>
      <div>
        <h3>Essay Questions</h3>
        {formData.essayQuestions.map((question, index) => (
          <div key={index}>
            <textarea
              value={question}
              onChange={(e) => handleEssayQuestionChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleAddEssayQuestion}>Add Essay Question</button>
      </div>
      <button onClick={handleSaveForm}>Save Form</button>
    </div>
  );
};

export default EvaluationFormManager;