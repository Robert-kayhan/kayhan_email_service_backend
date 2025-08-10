import { Request, Response } from "express";
import Flyer from "../models/flyer/Flyer";
import ProductSpecification from "../models/flyer/Specification";
import { generateStyledFlyerPdf } from "../utils/generateStyledFlyerPdf";

// Helper for simple validation
function validateFlyerData(data: any) {
  const errors: string[] = [];

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim() === ""
  ) {
    errors.push("Title is required and must be a non-empty string.");
  }

  if (data.productOneImageUrl && typeof data.productOneImageUrl !== "string") {
    errors.push("productOneImageUrl must be a string.");
  }

  if (data.productTwoImageUrl && typeof data.productTwoImageUrl !== "string") {
    errors.push("productTwoImageUrl must be a string.");
  }

  if (
    data.productSpecificationIdOne !== undefined &&
    data.productSpecificationIdOne !== null &&
    !Number.isInteger(data.productSpecificationIdOne)
  ) {
    errors.push("productSpecificationIdOne must be an integer.");
  }

  if (
    data.productSpecificationIdTwo !== undefined &&
    data.productSpecificationIdTwo !== null &&
    !Number.isInteger(data.productSpecificationIdTwo)
  ) {
    errors.push("productSpecificationIdTwo must be an integer.");
  }

  if (data.description && typeof data.description !== "string") {
    errors.push("Description must be a string.");
  }

  return errors;
}



// ---------------------- PDF GENERATOR ----------------------


// ---------------------- CONTROLLER ----------------------
export const createFlyer = async (req: Request, res: Response) => {
  try {
    const errors = validateFlyerData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const {
      title,
      description,
      prodcutoneimageUrl,
      prodcutwoimageUrl,
      productSpecificationId,
      productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
    } = req.body;

    const flyerData = {
      title,
      description,
      productOneImageUrl: prodcutoneimageUrl,
      productTwoImageUrl: prodcutwoimageUrl,
      productSpecificationIdOne: productSpecificationId,
      productSpecificationIdTwo: productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
    };

    if (flyerData.productSpecificationIdOne) {
      const exists = await ProductSpecification.findByPk(
        flyerData.productSpecificationIdOne
      );
      if (!exists) {
         res.status(400).json({
          success: false,
          message: "Invalid productSpecificationIdOne",
        });
        return
      }
    }

    if (flyerData.productSpecificationIdTwo) {
      const exists = await ProductSpecification.findByPk(
        flyerData.productSpecificationIdTwo
      );
      if (!exists) {
         res.status(400).json({
          success: false,
          message: "Invalid productSpecificationIdTwo",
        });
      }
      return
    }

    const flyer = await Flyer.create(flyerData);

    // Generate PDF
    const pdfPath = await generateStyledFlyerPdf({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: "Product One",
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: "Product Two",
      },
      specs: [],
    });

    res.status(201).json({
      success: true,
      data: flyer,
      pdf: pdfPath,
    });
  } catch (error: any) {
     res.status(500).json({ success: false, message: error.message });
  }
};


// Get all flyers
export const getAllFlyers = async (req: Request, res: Response) => {
  try {
    const flyers = await Flyer.findAll();
    res.json({ success: true, data: flyers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get flyer by ID
export const getFlyerById = async (req: Request, res: Response) => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);
    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
    }
    res.json({ success: true, data: flyer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update flyer by ID
export const updateFlyer = async (req: Request, res: Response) => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);
    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }

    const errors = validateFlyerData(req.body);
    if (errors.length > 0) {
       res.status(400).json({ success: false, errors });
       return
    }

    await flyer.update(req.body);
    res.json({ success: true, data: flyer });
  } catch (error: any) {
     res.status(500).json({ success: false, message: error.message });
  }
};

// Delete flyer by ID
export const deleteFlyer = async (req: Request, res: Response) => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);
    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }
    await flyer.destroy();
    res.json({ success: true, message: "Flyer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
