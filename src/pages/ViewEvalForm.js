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

  useEffect(() => {
    const fetchEvalData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userUid = currentUser.uid;
          const meetingRef = doc(db, "meetings", eventId);
          const evalRef = doc(collection(meetingRef, "evaluations"), evalId);
          const evalSnapshot = await getDoc(evalRef);

          if (evalSnapshot.exists()) {
            const evalData = evalSnapshot.data();
            setFormData({
              ...evalData
            });
          } else {
            console.log("Evaluation document does not exist");
          }
        }
      } catch (error) {
        console.error("Error fetching evaluation data:", error);
      }
    };

    fetchEvalData();
  }, [eventId, evalId]);

  const ratingLabels = [
    "The activitywas in-line with the DYCI Vision-Mission and core values",
    "The activity achieved its goals/objectives (or theme)",
    "The activity met the need of the students",
    "The committees performed their service",
    "The activity was well-participated by uthe student",
    "The date and time was appropriate for the activity",
    "The venue was appropriate for the activity",
    "The school resources were properly managed",
    "The activity was well organized and well planned",
    "The activity was well attended by the participants",
  ];

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
          {ratingLabels.map((label, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">{`${
                index + 1
              }. ${label}`}</label>
              <div className="flex justify-between">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <span key={rating} className="inline-flex items-center mr-4">
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
          <div className="mb-4">
            <textarea
              name="bestFeatures"
              placeholder="A. Best features of the activity and good values promoted and inculcated."
              value={formData.bestFeatures}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="suggestions"
              placeholder="B. Suggestions for further improvements of the activity."
              value={formData.suggestions}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <textarea
              name="otherComments"
              placeholder="C. Other comments and reaction."
              value={formData.otherComments}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              CORE VALUE APPLIED
            </label>
            <div className="flex flex-wrap">
              <div className="mr-4 mb-2">
                <input
                  type="checkbox"
                  name="coreValues"
                  value="CARITAS(Charity)"
                  checked={formData.coreValues.includes("CARITAS(Charity)")}
                  disabled
                  id="caritas"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <label htmlFor="caritas" className="ml-2 text-gray-700">
                  CARITAS(Charity)
                </label>
              </div>
              <div className="mr-4 mb-2">
                <input
                  type="checkbox"
                  name="coreValues"
                  value="SAPIENTIA(Wisdom)"
                  checked={formData.coreValues.includes("SAPIENTIA(Wisdom)")}
                  disabled
                  id="sapientia"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <label htmlFor="sapientia" className="ml-2 text-gray-700">
                  SAPIENTIA(Wisdom)
                </label>
              </div>
              <div className="mr-4 mb-2">
                <input
                  type="checkbox"
                  name="coreValues"
                  value="VERITAS(Truth)"
                  checked={formData.coreValues.includes("VERITAS(Truth)")}
                  disabled
                  id="veritas"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <label htmlFor="veritas" className="ml-2 text-gray-700">
                  VERITAS(Truth)
                </label>
              </div>
              <div className="mr-4 mb-2">
                <input
                  type="checkbox"
                  name="coreValues"
                  value="PATRIA(Patriotism)"
                  checked={formData.coreValues.includes("PATRIA(Patriotism)")}
                  disabled
                  id="patria"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <label htmlFor="patria" className="ml-2 text-gray-700">
                  PATRIA(Patriotism)
                </label>
              </div>
              <div className="mr-4 mb-2">
                <input
                  type="checkbox"
                  name="coreValues"
                  value="EXCELLENTIA(Excellence)"
                  checked={formData.coreValues.includes(
                    "EXCELLENTIA(Excellence)"
                  )}
                  disabled
                  id="excellentia"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <label htmlFor="excellentia" className="ml-2 text-gray-700">
                  EXCELLENTIA(Excellence)
                </label>
              </div>
              <div className="mr-4 mb-2">
                <input
                  type="checkbox"
                  name="coreValues"
                  value="FIDES(Faith)"
                  checked={formData.coreValues.includes("FIDES(Faith)")}
                  disabled
                  id="fides"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <label htmlFor="fides" className="ml-2 text-gray-700">
                  FIDES(Faith)
                </label>
              </div>
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
