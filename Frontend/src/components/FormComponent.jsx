import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import axios from "axios";

const FormComponent = () => {
  const [files, setFiles] = useState([
    { id: Date.now(), fileName: "", fileType: "", file: null },
    { id: Date.now() + 1, fileName: "", fileType: "", file: null },
  ]);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    residentialAddress: { street1: "", street2: "" },
    permanentAddress: { street1: "", street2: "" },
    sameAsResidential: false,
  });

  // Error state
  const [errors, setErrors] = useState({});

  const handleFileAdd = () => {
    setFiles([
      ...files,
      { id: Date.now(), fileName: "", fileType: "", file: null },
    ]);
  };

  const handleFileChange = (e, id, field) => {
    const newFiles = files.map((file) =>
      file.id === id ? { ...file, [field]: e.target.value } : file
    );
    setFiles(newFiles);
  };

  const handleFileUpload = (e, id) => {
    const selectedFile = e.target.files[0];

    const selectedFileType = files.find((f) => f.id === id).fileType;

    if (!selectedFileType) {
      alert("Please select a file type before uploading.");
      return;
    }

    const validFileTypes = {
      image: ["image/jpeg", "image/png", "image/gif"],
      pdf: ["application/pdf"],
      other: [],
    };

    if (
      (selectedFileType === "image" &&
        !validFileTypes.image.includes(selectedFile.type)) ||
      (selectedFileType === "pdf" &&
        !validFileTypes.pdf.includes(selectedFile.type))
    ) {
      alert(`Please upload a valid ${selectedFileType} file.`);
      return;
    }

    const newFiles = files.map((file) =>
      file.id === id
        ? {
            ...file,
            fileName: selectedFile.name,
            fileType: selectedFileType,
            file: selectedFile,
          }
        : file
    );

    setFiles(newFiles);
  };

  const handleFileDelete = (id) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name.startsWith("residentialAddress")) {
      const addressField = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        residentialAddress: {
          ...prevState.residentialAddress,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith("permanentAddress")) {
      const addressField = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        permanentAddress: {
          ...prevState.permanentAddress,
          [addressField]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddressToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData((prevState) => ({
      ...prevState,
      sameAsResidential: isChecked,
      permanentAddress: isChecked
        ? {
            street1: prevState.residentialAddress.street1,
            street2: prevState.residentialAddress.street2,
          }
        : { street1: "", street2: "" },
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return !value ? "First name is required." : null;
      case "lastName":
        return !value ? "Last name is required." : null;
      case "email":
        return !value ? "Email is required." : null;
      case "dob":
        return !value ? "Date of Birth is required." : null;
      case "residentialAddress.street1":
        return !value ? "Street 1 is required." : null;
      case "residentialAddress.street2":
        return !value ? "Street 2 is required." : null;
      case "permanentAddress.street1":
        return !value && !formData.sameAsResidential
          ? "Permanent Street 1 is required."
          : null;
      case "permanentAddress.street2":
        return !value && !formData.sameAsResidential
          ? "Permanent Street 2 is required."
          : null;
      default:
        return null;
    }
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key === "residentialAddress" || key === "permanentAddress") {
        const address = formData[key];
        const street1Error = validateField(`${key}.street1`, address.street1);
        const street2Error = validateField(`${key}.street2`, address.street2);
        if (street1Error) {
          newErrors[`${key}.street1`] = street1Error;
          isValid = false;
        }
        if (street2Error) {
          newErrors[`${key}.street2`] = street2Error;
          isValid = false;
        }
      } else {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "documents") {
          if (key === "residentialAddress" || key === "permanentAddress") {
            formDataObj.append(key, JSON.stringify(formData[key]));
          } else {
            formDataObj.append(key, formData[key]);
          }
        }
      });
      files.forEach((file) => {
        if (file.file) {
          formDataObj.append("documents", file.file);
        }
      });

      const response = await axios.post(
        "http://localhost:5000/api/form/submit",
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.error || "Form submission failed");
    }
  };

  const handleFileTypeSelect = (e, id) => {
    const selectedType = e.target.value;
    const newFiles = files.map((file) =>
      file.id === id ? { ...file, fileType: selectedType } : file
    );
    setFiles(newFiles);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4">User Information</h2>

      <div className="flex justify-center align-middle gap-8">
        <div className="flex flex-col w-full">
          <label htmlFor="firstName" className="mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="First Name *"
            required
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`p-2 mb-1 border border-gray-300 rounded ${
              errors.firstName && touched.firstName ? "border-red-500" : ""
            }`}
          />
          <span className={`text-red-500 text-sm h-4`}>
            {errors.firstName && touched.firstName ? errors.firstName : ""}
          </span>
        </div>

        <div className="flex flex-col w-full">
          <label htmlFor="lastName" className="mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Last Name *"
            required
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`p-2 mb-1 border border-gray-300 rounded ${
              errors.lastName && touched.lastName ? "border-red-500" : ""
            }`}
          />
          <span className={`text-red-500 text-sm h-4`}>
            {errors.lastName && touched.lastName ? errors.lastName : ""}
          </span>
        </div>
      </div>

      <div className="flex justify-center align-middle gap-8">
        <div className="flex flex-col w-full">
          <label htmlFor="email" className="mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email *"
            required
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`p-2 mb-1 border border-gray-300 rounded ${
              errors.email && touched.email ? "border-red-500" : ""
            }`}
          />
          <span className={`text-red-500 text-sm h-4`}>
            {errors.email && touched.email ? errors.email : ""}
          </span>
        </div>

        <div className="flex flex-col w-full">
          <label htmlFor="dob" className="mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dob"
            id="dob"
            required
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`p-2 mb-1 border border-gray-300 rounded ${
              errors.dob && touched.dob ? "border-red-500" : ""
            }`}
          />
          <span className={`text-red-500 text-sm h-4`}>
            {errors.dob && touched.dob ? errors.dob : ""}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Residential Address</h3>
      <div className="flex gap-10">
        <div className="flex flex-col w-full">
          <label htmlFor="residentialAddress.street1" className="mb-1">
            Street 1 *
          </label>
          <input
            type="text"
            name="residentialAddress.street1"
            id="residentialAddress.street1"
            placeholder="Street 1 *"
            required
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`p-2 mb-1 border border-gray-300 rounded ${
              errors["residentialAddress.street1"] &&
              touched["residentialAddress.street1"]
                ? "border-red-500"
                : ""
            }`}
          />
          <span className={`text-red-500 text-sm h-4`}>
            {errors["residentialAddress.street1"] &&
            touched["residentialAddress.street1"]
              ? errors["residentialAddress.street1"]
              : ""}
          </span>
        </div>

        <div className="flex flex-col w-full">
          <label htmlFor="residentialAddress.street2" className="mb-1">
            Street 2 *
          </label>
          <input
            type="text"
            name="residentialAddress.street2"
            id="residentialAddress.street2"
            placeholder="Street 2 *"
            required
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`p-2 mb-1 border border-gray-300 rounded ${
              errors["residentialAddress.street2"] &&
              touched["residentialAddress.street2"]
                ? "border-red-500"
                : ""
            }`}
          />
          <span className={`text-red-500 text-sm h-4`}>
            {errors["residentialAddress.street2"] &&
            touched["residentialAddress.street2"]
              ? errors["residentialAddress.street2"]
              : ""}
          </span>
        </div>
      </div>

      {/* <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          onChange={handleAddressToggle}
          className="mr-2"
        />
        Same as Residential
      </label> */}

      <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          checked={formData.sameAsResidential}
          onChange={handleAddressToggle}
          className="mr-2"
        />
        Same as Residential
      </label>

      <h3 className="text-lg font-semibold mt-4 mb-2">Permanent Address</h3>

      <div className="flex gap-10">
        <div className="flex flex-col w-full">
          <label htmlFor="permanentAddress.street1" className="mb-1">
            Permanent Street 1
          </label>
          <input
            type="text"
            name="permanentAddress.street1"
            id="permanentAddress.street1"
            placeholder="Permanent Street 1"
            required={!formData.sameAsResidential}
            onChange={handleInputChange}
            className="p-2 mb-4 border border-gray-300 rounded"
            disabled={formData.sameAsResidential}
          />
        </div>

        <div className="flex flex-col w-full">
          <label htmlFor="permanentAddress.street2" className="mb-1">
            Permanent Street 2
          </label>
          <input
            type="text"
            name="permanentAddress.street2"
            id="permanentAddress.street2"
            placeholder="Permanent Street 2"
            required={!formData.sameAsResidential}
            onChange={handleInputChange}
            className="p-2 mb-4 border border-gray-300 rounded"
            disabled={formData.sameAsResidential}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Upload Documents</h3>
      <div className="document-uploader">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="mb-4 p-2 border-gray-300 rounded flex items-center gap-4"
          >
            <div className="flex flex-col flex-1">
              <label htmlFor={`fileName-${file.id}`} className="mb-1">
                File Name
              </label>
              <input
                type="text"
                id={`fileName-${file.id}`}
                placeholder="File Name"
                value={file.fileName}
                onChange={(e) => handleFileChange(e, file.id, "fileName")}
                className="p-2 mb-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex flex-col flex-none">
              <label htmlFor={`fileType-${file.id}`} className="mb-1">
                File Type
              </label>
              <select
                id={`fileType-${file.id}`}
                value={file.fileType}
                onChange={(e) => handleFileTypeSelect(e, file.id)}
                className="p-2 mb-2 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Select file type
                </option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col flex-none">
              <label htmlFor={`fileUpload-${file.id}`} className="mb-1">
                Upload File
              </label>
              <div className="relative">
                <input
                  type="file"
                  id={`fileUpload-${file.id}`}
                  onChange={(e) => handleFileUpload(e, file.id)}
                  className="hidden"
                />
                <label
                  htmlFor={`fileUpload-${file.id}`}
                  className={`p-2 border border-gray-300 rounded cursor-pointer flex items-center space-x-2 ${
                    !file.fileType ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (!file.fileType) {
                      e.preventDefault();
                    }
                  }}
                >
                  <span>Select File</span>
                  <span>
                    <FiUpload />
                  </span>
                </label>
              </div>
            </div>

            {index > 0 && (
              <button
                type="button"
                onClick={() => handleFileDelete(file.id)}
                className="text-red-500 flex-none p-2 border border-gray-300 rounded mt-6"
              >
                <MdDeleteOutline size={24} />
              </button>
            )}
            {index === 0 && (
              <button
                type="button"
                onClick={handleFileAdd}
                className="flex-none p-2 border border-gray-300 rounded mt-6"
              >
                <FaPlus size={24} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default FormComponent;
