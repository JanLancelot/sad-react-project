import React, { useState, useEffect } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useParams } from "react-router-dom";
import Layout from "./Layout";

const ViewEvalForm = () => {
  const { eventId, evalId } = useParams();
  const [formData, setFormData] = useState({
    fullName: "",
    yearSection: "",
    ratings: Array(10).fill(null),
    bestFeatures: "",
    suggestions: "",
    otherComments: "",
    coreValues: [],
    averageRating: null,
  });
  const [ratingLabels, setRatingLabels] = useState([]);
  const [essayQuestions, setEssayQuestions] = useState([]);
  const [values, setValues] = useState([]);

  useEffect(() => {
    const fetchEvalData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userUid = currentUser.uid;
          const meetingRef = doc(db, "meetings", eventId);
          const meetingSnapshot = await getDoc(meetingRef);

          if (meetingSnapshot.exists()) {
            const meetingData = meetingSnapshot.data();
            const formEvalId = meetingData.evaluationId;
            const formEvalRef = doc(db, "evaluationForms", formEvalId);
            const formEvalSnapshot = await getDoc(formEvalRef);

            if (formEvalSnapshot.exists()) {
              const formEvalData = formEvalSnapshot.data();
              setRatingLabels(formEvalData.ratingLabels);
              setEssayQuestions(formEvalData.essayQuestions);
              setValues(formEvalData.values);
            } else {
              console.log("Evaluation form document does not exist");
            }

            const evalRef = doc(collection(meetingRef, "evaluations"), evalId);
            const evalSnapshot = await getDoc(evalRef);

            if (evalSnapshot.exists()) {
              const evalData = evalSnapshot.data();
              setFormData({
                ...evalData,
              });
            } else {
              console.log("Evaluation document does not exist");
            }
          } else {
            console.log("Meeting document does not exist");
          }
        }
      } catch (error) {
        console.error("Error fetching evaluation data:", error);
      }
    };

    fetchEvalData();
  }, [eventId, evalId]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <input
              type="text"
              name="fullName"
              placeholder="Name of Participant"
              value={formData.fullName}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="yearSection"
              placeholder="Course and Year"
              value={formData.yearSection}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <b>LEGEND</b>: Excellent <b>( 5 )</b> Very Good <b>( 4 )</b> Good{" "}
            <b>( 3 )</b> Needs Improvement <b>( 2 )</b> Poor <b>( 1 )</b>
          </div>
          {ratingLabels &&
            ratingLabels.length > 0 &&
            ratingLabels.map((label, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">{`${
                  index + 1
                }. ${label}`}</label>
                <div className="flex justify-between">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <span
                      key={rating}
                      className="inline-flex items-center mr-4"
                    >
                      <input
                        type="radio"
                        name={`ratings[${index}]`}
                        value={rating}
                        checked={formData.ratings[index] === rating}
                        disabled
                        className="form-radio h-5 w-5 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">{rating}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          {essayQuestions &&
            essayQuestions.length > 0 &&
            essayQuestions.map((question, index) => (
              <div key={index} className="mb-4">
                <textarea
                  name={`essayQuestion${index}`}
                  placeholder={question}
                  value={formData[`essayQuestion${index}`]}
                  disabled
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            ))}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              CORE VALUES APPLIED
            </label>
            <div className="flex flex-wrap">
              {values &&
                values.length > 0 &&
                values.map((value, index) => (
                  <div key={index} className="mr-4 mb-2">
                    <input
                      type="checkbox"
                      name="coreValues"
                      value={value}
                      checked={formData.coreValues.includes(value)}
                      disabled
                      id={`value-${index}`}
                      className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                    <label
                      htmlFor={`value-${index}`}
                      className="ml-2 text-gray-700"
                    >
                      {value}
                    </label>
                  </div>
                ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Average Rating
            </label>
            <input
              type="text"
              name="averageRating"
              value={formData.averageRating}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewEvalForm;
