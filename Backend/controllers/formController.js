const FormData = require("../models/FormData");

exports.submitForm = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dob,
      residentialAddress,
      sameAsResidential,
      permanentAddress,
    } = req.body;

    const parsedResidentialAddress =
      typeof residentialAddress === "string"
        ? JSON.parse(residentialAddress)
        : residentialAddress;
    const parsedPermanentAddress =
      typeof permanentAddress === "string"
        ? JSON.parse(permanentAddress)
        : permanentAddress;

    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const isBirthdayPassed =
      new Date().setFullYear(
        new Date().getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      ) >= Date.now();

    if (age < 18 || (age === 18 && !isBirthdayPassed)) {
      return res
        .status(400)
        .json({ error: "User must be at least 18 years old." });
    }

    console.log("Residential Address:", parsedResidentialAddress);
    if (
      !parsedResidentialAddress ||
      !parsedResidentialAddress.street1 ||
      !parsedResidentialAddress.street2
    ) {
      return res
        .status(400)
        .json({ error: "Residential address fields are required." });
    }

    if (!sameAsResidential) {
      if (
        !parsedPermanentAddress ||
        !parsedPermanentAddress.street1 ||
        !parsedPermanentAddress.street2
      ) {
        return res
          .status(400)
          .json({
            error:
              "Permanent address is required if not the same as residential address.",
          });
      }
    }

    if (!req.files || req.files.length < 2) {
      return res
        .status(400)
        .json({ error: "Minimum two documents are required." });
    }

    const documents = req.files.map((file) => {
      if (!file.mimetype.includes("image") && !file.mimetype.includes("pdf")) {
        return res
          .status(400)
          .json({
            error: "Invalid file type. Only image and PDF files are allowed.",
          });
      }
      return {
        fileName: file.originalname,
        fileType: file.mimetype.includes("image") ? "image" : "pdf",
        filePath: file.path,
      };
    });

    const formData = new FormData({
      firstName,
      lastName,
      email,
      dob,
      residentialAddress: parsedResidentialAddress,
      sameAsResidential,
      permanentAddress: parsedPermanentAddress,
      documents,
    });

    await formData.save();
    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error while submitting form:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
